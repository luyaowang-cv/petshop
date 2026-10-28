"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Card,
  message,
  Avatar,
  Tooltip,
  Form,
  Descriptions,
  Empty,
  Select,
  Tabs,
  InputNumber,
  DatePicker,
  Divider,
  Switch,
  Collapse,
  Row,
  Col,
  Statistic,
  Upload,
} from "antd";
import type { TableProps } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  TeamOutlined,
  CloseOutlined,
  EyeOutlined,
  ShoppingOutlined,
  CrownOutlined,
  IdcardOutlined,
  GiftOutlined,
  WalletOutlined,
  ManOutlined,
  WomanOutlined,
  QuestionOutlined,
  CalendarOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  WarningOutlined,
  SettingOutlined,
  DollarOutlined,
  HistoryOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Customer, MemberLevel } from "@/@types/Customer";
import { PetType, PetGender } from "@/@types/Pet";
import { CUSTOMER, COMMON, MEMBER } from "@/constants/i18n";
import {
  CUSTOMER_KEY,
  fetchCustomers,
  deleteCustomer,
  createCustomer,
  updateCustomer,
  addCustomerPet,
  editCustomerPet,
  removeCustomerPet,
  fetchCustomerConsumptionRecords,
} from "@/services/queries/Customer";
import { uploadImage } from "@/services/queries/Upload";
import { assetUrl } from "@/utils/assetUrl";
import {
  createRechargeRecord,
  createPointsRecord,
  fetchRechargeRecords,
  fetchPointsRecords,
  fetchPointsRule,
  updatePointsRule,
  RechargeRecord,
  PointsRecord,
} from "@/services/queries/Member";
import axios from "axios";
import { APIError } from "@/@types/API";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;

// 充值记录表格组件
function RechargeHistoryTable({ customerId }: { customerId: string }) {
  const { data: records, isLoading } = useQuery({
    queryKey: ["rechargeRecords", customerId],
    queryFn: () => fetchRechargeRecords(customerId),
    enabled: !!customerId,
  });

  return (
    <div style={{ padding: "16px 0" }}>
      <Table
        columns={[
          {
            title: "充值时间",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 180,
            render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
          },
          {
            title: "充值金额",
            dataIndex: "amount",
            key: "amount",
            width: 120,
            render: (amount) => (
              <span style={{ color: "#52c41a", fontWeight: 600 }}>
                ¥{(amount / 100).toFixed(2)}
              </span>
            ),
          },
          {
            title: "充值后余额",
            dataIndex: "balance",
            key: "balance",
            width: 120,
            render: (balance) => `¥${(balance / 100).toFixed(2)}`,
          },
          {
            title: "备注",
            dataIndex: "note",
            key: "note",
            render: (note) => note || "-",
          },
        ]}
        dataSource={records || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        locale={{ emptyText: "暂无充值记录" }}
        size="small"
      />
    </div>
  );
}

// 积分记录表格组件
function PointsHistoryTable({ customerId }: { customerId: string }) {
  const { data: records, isLoading } = useQuery({
    queryKey: ["pointsRecords", customerId],
    queryFn: () => fetchPointsRecords(customerId),
    enabled: !!customerId,
  });

  const getActionText = (action: string) => {
    const map: Record<string, string> = {
      ADD: "增加",
      DEDUCT: "扣除",
      CONSUME: "消费获得",
      EXPIRE: "过期",
    };
    return map[action] || action;
  };

  const getActionColor = (action: string) => {
    return action === "ADD" || action === "CONSUME" ? "green" : "orange";
  };

  return (
    <div style={{ padding: "16px 0" }}>
      <Table
        columns={[
          {
            title: "变动时间",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 180,
            render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
          },
          {
            title: "变动类型",
            dataIndex: "action",
            key: "action",
            width: 100,
            render: (action) => (
              <Tag color={getActionColor(action)}>{getActionText(action)}</Tag>
            ),
          },
          {
            title: "积分变动",
            dataIndex: "points",
            key: "points",
            width: 100,
            render: (points, record: PointsRecord) => (
              <span
                style={{
                  color:
                    record.action === "ADD" || record.action === "CONSUME"
                      ? "#52c41a"
                      : "#fa8c16",
                  fontWeight: 600,
                }}
              >
                {record.action === "ADD" || record.action === "CONSUME"
                  ? "+"
                  : "-"}
                {points}
              </span>
            ),
          },
          {
            title: "变动后积分",
            dataIndex: "balance",
            key: "balance",
            width: 120,
          },
          {
            title: "说明",
            dataIndex: "reason",
            key: "reason",
            render: (reason) => reason || "-",
          },
        ]}
        dataSource={records || []}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        locale={{ emptyText: "暂无积分记录" }}
        size="small"
      />
    </div>
  );
}

interface PetFormData {
  id?: string; // 编辑模式下会有id
  name: string;
  breed: string;
  age: number;
  petType?: PetType;
  gender?: PetGender;
  birthday?: string | null;
  isNeutered?: boolean;
  vaccineInfo?: string | null;
  allergyHistory?: string | null;
  healthNotes?: string | null;
  imageUrl?: string | null;
}

interface CustomerFormData {
  name: string;
  phone: string;
  pets: PetFormData[];
  // 会员信息
  memberLevel?: MemberLevel;
  initialRecharge?: number; // 初始充值金额（元）
  initialPoints?: number; // 赠送积分
}

interface CustomerUpdateData {
  name: string;
  phone: string;
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [form] = Form.useForm();
  const [pets, setPets] = useState<PetFormData[]>([]);
  const [activeTab, setActiveTab] = useState("basic"); // Tab状态

  // 会员管理相关状态
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [pointsModalVisible, setPointsModalVisible] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [pointsRulesVisible, setPointsRulesVisible] = useState(false);
  const [showRechargeHistory, setShowRechargeHistory] = useState(false);
  const [showPointsHistory, setShowPointsHistory] = useState(false);
  const [rechargeForm] = Form.useForm();
  const [pointsForm] = Form.useForm();
  const [upgradeForm] = Form.useForm();
  const [pointsRulesForm] = Form.useForm();

  // 查询客户列表
  const { data, isLoading } = useQuery({
    queryKey: [CUSTOMER_KEY],
    queryFn: fetchCustomers,
  });

  // 查询消费记录
  const { data: consumptionData, isLoading: isLoadingConsumption } = useQuery({
    queryKey: ["customer-consumption", selectedCustomer?.id],
    queryFn: () =>
      selectedCustomer
        ? fetchCustomerConsumptionRecords(selectedCustomer.id, 1, 10)
        : Promise.resolve({ records: [], total: 0, page: 1, pageSize: 10 }),
    enabled: !!selectedCustomer && detailModalVisible,
  });

  // 创建客户
  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      // 1. 创建客户
      const customerData = {
        name: data.name,
        phone: data.phone,
        pets: data.pets,
      };
      const response = await createCustomer(customerData);
      const newCustomer = response.customer; // 从响应中提取 customer 对象

      // 2. 如果设置了会员等级（非普通客户），更新会员信息
      if (data.memberLevel && data.memberLevel !== MemberLevel.REGULAR) {
        const updateData: any = {
          name: data.name,
          phone: data.phone,
          memberLevel: data.memberLevel,
          memberJoinedAt: new Date().toISOString(),
        };

        await updateCustomer(newCustomer.id, updateData);
      }

      // 3. 如果有初始充值，创建充值记录
      if (data.initialRecharge && data.initialRecharge > 0) {
        await createRechargeRecord(newCustomer.id, {
          amount: data.initialRecharge * 100, // 转换为分
          note: "新客户初始充值",
        });
      }

      // 4. 如果有赠送积分，创建积分记录
      if (data.initialPoints && data.initialPoints > 0) {
        await createPointsRecord(newCustomer.id, {
          points: data.initialPoints,
          action: "ADD",
          reason: "新客户赠送积分",
        });
      }

      return newCustomer;
    },
    onSuccess: () => {
      message.success("客户创建成功");
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
      handleCloseModal();
    },
    onError: (error) => {
      console.error("客户创建失败:", error);
      message.error("客户创建失败，请重试");
    },
  });

  // 更新客户
  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerUpdateData }) =>
      updateCustomer(id, data),
    onSuccess: () => {
      message.success("客户更新成功");
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
      handleCloseModal();
    },
    onError: () => {
      message.error("客户更新失败，请重试");
    },
  });

  // 添加宠物
  const addPetMutation = useMutation({
    mutationFn: ({
      customerId,
      pet,
    }: {
      customerId: string;
      pet: PetFormData;
    }) => addCustomerPet(customerId, pet),
    onSuccess: () => {
      message.success("宠物添加成功");
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
    },
    onError: () => {
      message.error("宠物添加失败，请重试");
    },
  });

  // 更新宠物
  const updatePetMutation = useMutation({
    mutationFn: ({ petId, pet }: { petId: string; pet: PetFormData }) =>
      editCustomerPet(petId, pet),
    onSuccess: () => {
      message.success("宠物更新成功");
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
    },
    onError: () => {
      message.error("宠物更新失败，请重试");
    },
  });

  // 删除宠物
  const deletePetMutation = useMutation({
    mutationFn: (petId: string) => removeCustomerPet(petId),
    onSuccess: () => {
      message.success("宠物删除成功");
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
    },
    onError: (err) => {
      if (
        axios.isAxiosError(err) &&
        (err.response?.data as APIError).name === "InvalidDeleteOperation"
      ) {
        message.error("该宠物已有预约记录，无法删除");
      } else {
        message.error("删除宠物失败，请重试");
      }
    },
  });

  // 删除客户
  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      message.success("客户删除成功");
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
    },
    onError: (err) => {
      if (
        axios.isAxiosError(err) &&
        (err.response?.data as APIError).name === "InvalidDeleteOperation"
      ) {
        message.error("该客户已有预约记录，无法删除");
      } else {
        message.error("删除客户失败，请重试");
      }
    },
  });

  // 过滤客户数据
  const filteredCustomers = data?.customers?.filter((customer) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.phone.includes(search)
    );
  });

  // 打开创建弹窗
  const handleCreate = () => {
    setModalMode("create");
    setEditingCustomer(null);
    form.resetFields();
    // 设置默认值
    form.setFieldsValue({
      memberLevel: MemberLevel.REGULAR,
    });
    setPets([]);
    setActiveTab("basic"); // 重置到基本信息Tab
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (customer: Customer) => {
    setModalMode("edit");
    setEditingCustomer(customer);
    // 从 +55 9 17888888888 格式中提取11位手机号
    const rawPhone = customer.phone.replace(/\D/g, ""); // 移除所有非数字字符
    const phone11Digits = rawPhone.slice(-11); // 取最后11位
    form.setFieldsValue({
      name: customer.name,
      phone: phone11Digits,
    });
    setPets(customer.pets || []);
    setActiveTab("basic"); // 重置到基本信息Tab
    setModalVisible(true);
  };

  // 打开详情弹窗
  const handleViewDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailModalVisible(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setModalVisible(false);
    setDetailModalVisible(false);
    form.resetFields();
    setPets([]);
    setEditingCustomer(null);
    setSelectedCustomer(null);
    setActiveTab("basic"); // 重置Tab
  };

  // 添加宠物
  const handleAddPet = () => {
    setPets([
      ...pets,
      {
        name: "",
        breed: "",
        age: 0,
        petType: PetType.OTHER,
        gender: PetGender.UNKNOWN,
        birthday: null,
        isNeutered: false,
        vaccineInfo: null,
        allergyHistory: null,
        healthNotes: null,
        imageUrl: null,
      },
    ]);
  };

  // 删除宠物
  const handleRemovePet = (index: number) => {
    setPets(pets.filter((_, i) => i !== index));
  };

  // 更新宠物信息
  const handlePetChange = (
    index: number,
    field: keyof PetFormData,
    value: any,
  ) => {
    const newPets = [...pets];
    newPets[index] = { ...newPets[index], [field]: value };
    setPets(newPets);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("表单值:", values);

      if (modalMode === "create") {
        const formData: CustomerFormData = {
          name: values.name,
          phone: `+559${values.phone}`, // 添加国家代码和9（无空格）
          pets: pets.filter((pet) => pet.name && pet.breed),
          // 会员信息
          memberLevel: values.memberLevel || MemberLevel.REGULAR,
          initialRecharge: values.initialRecharge,
          initialPoints: values.initialPoints,
        };
        console.log("创建客户数据:", formData);
        await createCustomerMutation.mutateAsync(formData);
      } else if (editingCustomer) {
        // 更新客户基本信息
        const updateData = {
          name: values.name,
          phone: `+559${values.phone}`, // 添加国家代码和9（无空格）
        };
        console.log("更新客户数据:", updateData);
        await updateCustomerMutation.mutateAsync({
          id: editingCustomer.id,
          data: updateData,
        });

        // 处理宠物信息的变更
        // 1. 找出需要添加的新宠物（没有id的）
        const newPets = pets.filter((pet) => !pet.id && pet.name && pet.breed);
        for (const pet of newPets) {
          await addPetMutation.mutateAsync({
            customerId: editingCustomer.id,
            pet: {
              name: pet.name,
              breed: pet.breed,
              age: pet.age,
              petType: pet.petType || PetType.OTHER,
              gender: pet.gender || PetGender.UNKNOWN,
              birthday: pet.birthday || undefined,
              isNeutered: pet.isNeutered || false,
              vaccineInfo: pet.vaccineInfo || undefined,
              allergyHistory: pet.allergyHistory || undefined,
              healthNotes: pet.healthNotes || undefined,
              imageUrl: pet.imageUrl || undefined,
            },
          });
        }

        // 2. 找出需要更新的宠物（有id且信息有变化的）
        const existingPets = pets.filter((pet) => pet.id);
        for (const pet of existingPets) {
          const originalPet = editingCustomer.pets.find((p) => p.id === pet.id);
          if (originalPet) {
            // 检查是否有任何字段变化
            const hasChanges =
              originalPet.name !== pet.name ||
              originalPet.breed !== pet.breed ||
              originalPet.age !== pet.age ||
              originalPet.petType !== pet.petType ||
              originalPet.gender !== pet.gender ||
              originalPet.birthday !== pet.birthday ||
              originalPet.isNeutered !== pet.isNeutered ||
              originalPet.vaccineInfo !== pet.vaccineInfo ||
              originalPet.allergyHistory !== pet.allergyHistory ||
              originalPet.healthNotes !== pet.healthNotes ||
              originalPet.imageUrl !== pet.imageUrl;

            if (hasChanges) {
              await updatePetMutation.mutateAsync({
                petId: pet.id,
                pet: {
                  name: pet.name,
                  breed: pet.breed,
                  age: pet.age,
                  petType: pet.petType || PetType.OTHER,
                  gender: pet.gender || PetGender.UNKNOWN,
                  birthday: pet.birthday || undefined,
                  isNeutered: pet.isNeutered || false,
                  vaccineInfo: pet.vaccineInfo || undefined,
                  allergyHistory: pet.allergyHistory || undefined,
                  healthNotes: pet.healthNotes || undefined,
                  imageUrl: pet.imageUrl || undefined,
                },
              });
            }
          }
        }

        // 3. 找出需要删除的宠物（原来有但现在没有的）
        const deletedPets = editingCustomer.pets.filter(
          (originalPet) => !pets.find((pet) => pet.id === originalPet.id),
        );
        for (const pet of deletedPets) {
          await deletePetMutation.mutateAsync(pet.id);
        }

        // 所有操作完成后关闭弹窗
        handleCloseModal();
      }
    } catch (error) {
      console.error("表单验证失败:", error);
      if (axios.isAxiosError(error)) {
        console.error("后端错误详情:", error.response?.data);
        message.error(error.response?.data?.message || "操作失败，请检查输入");
      }
    }
  };

  // 处理删除
  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: COMMON.CONFIRM_DELETE,
      content: `确定要删除客户"${name}"吗？删除后无法恢复。`,
      okText: COMMON.CONFIRM,
      cancelText: COMMON.CANCEL,
      okButtonProps: { danger: true },
      onOk: () => deleteCustomerMutation.mutate(id),
    });
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  // 打开充值弹窗
  const handleRecharge = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowRechargeHistory(false);
    rechargeForm.resetFields();
    setRechargeModalVisible(true);
  };

  // 打开积分弹窗
  const handlePoints = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPointsHistory(false);
    pointsForm.resetFields();
    setPointsModalVisible(true);
  };

  // 打开升级弹窗
  const handleUpgrade = (customer: Customer) => {
    setSelectedCustomer(customer);
    upgradeForm.setFieldsValue({
      memberLevel: customer.memberLevel,
    });
    setUpgradeModalVisible(true);
  };

  // 打开积分规则设置弹窗
  const handlePointsRules = async () => {
    try {
      const rule = await fetchPointsRule();
      if (rule) {
        pointsRulesForm.setFieldsValue({
          consumptionAmount: rule.spendAmount / 100,
          pointsEarned: rule.earnPoints,
          enabled: rule.isActive,
        });
      } else {
        pointsRulesForm.setFieldsValue({
          consumptionAmount: 100,
          pointsEarned: 10,
          enabled: true,
        });
      }
      setPointsRulesVisible(true);
    } catch (error) {
      console.error("加载积分规则失败:", error);
      pointsRulesForm.setFieldsValue({
        consumptionAmount: 100,
        pointsEarned: 10,
        enabled: true,
      });
      setPointsRulesVisible(true);
    }
  };

  // 提交充值
  const handleRechargeSubmit = async () => {
    try {
      const values = await rechargeForm.validateFields();
      if (!selectedCustomer) return;

      await createRechargeRecord(selectedCustomer.id, {
        amount: values.amount * 100,
        note: values.note,
      });

      message.success("充值成功");
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["rechargeRecords", selectedCustomer.id],
      });
      setRechargeModalVisible(false);
      setShowRechargeHistory(false);
      rechargeForm.resetFields();
      setSelectedCustomer(null);
    } catch (error) {
      console.error("充值失败:", error);
      message.error("充值失败，请重试");
    }
  };

  // 提交积分操作
  const handlePointsSubmit = async () => {
    try {
      const values = await pointsForm.validateFields();
      if (!selectedCustomer) return;

      await createPointsRecord(selectedCustomer.id, {
        points: values.points,
        action: values.action === "add" ? "ADD" : "DEDUCT",
        reason: values.reason,
      });

      message.success("积分操作成功");
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
      queryClient.invalidateQueries({
        queryKey: ["pointsRecords", selectedCustomer.id],
      });
      setPointsModalVisible(false);
      setShowPointsHistory(false);
      pointsForm.resetFields();
      setSelectedCustomer(null);
    } catch (error) {
      console.error("积分操作失败:", error);
      message.error("积分操作失败，请重试");
    }
  };

  // 提交升级
  const handleUpgradeSubmit = async () => {
    try {
      const values = await upgradeForm.validateFields();
      if (!selectedCustomer) return;

      const updateData: any = {
        name: selectedCustomer.name,
        phone: selectedCustomer.phone,
        memberLevel: values.memberLevel,
      };

      if (values.memberLevel !== MemberLevel.REGULAR) {
        if (selectedCustomer.memberLevel === MemberLevel.REGULAR) {
          updateData.memberJoinedAt = new Date().toISOString();
        }
      }

      await updateCustomerMutation.mutateAsync({
        id: selectedCustomer.id,
        data: updateData,
      });

      setUpgradeModalVisible(false);
      upgradeForm.resetFields();
      setSelectedCustomer(null);
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 提交积分规则设置
  const handlePointsRulesSubmit = async () => {
    try {
      const values = await pointsRulesForm.validateFields();
      await updatePointsRule({
        spendAmount: values.consumptionAmount * 100,
        earnPoints: values.pointsEarned,
        isActive: values.enabled,
      });
      message.success("积分规则设置成功");
      setPointsRulesVisible(false);
      pointsRulesForm.resetFields();
    } catch (error) {
      console.error("表单验证失败:", error);
      message.error("积分规则设置失败");
    }
  };

  // 统计数据
  const totalCustomers = data?.customers?.length || 0;
  const totalPets =
    data?.customers?.reduce((sum, c) => sum + c.pets.length, 0) || 0;
  const customersWithPets =
    data?.customers?.filter((c) => c.pets.length > 0).length || 0;
  const vipMembers =
    data?.customers?.filter((c) => c.memberLevel === MemberLevel.VIP).length ||
    0;
  const totalBalance =
    data?.customers?.reduce((sum, c) => sum + c.memberBalance, 0) || 0;
  const totalPoints =
    data?.customers?.reduce((sum, c) => sum + c.memberPoints, 0) || 0;

  // 获取会员等级标签
  const getMemberLevelTag = (level: MemberLevel) => {
    const config = {
      [MemberLevel.REGULAR]: { color: "default", text: MEMBER.LEVEL_REGULAR },
      [MemberLevel.VIP]: { color: "gold", text: MEMBER.LEVEL_VIP },
    };
    return config[level];
  };

  // 获取宠物类型文本
  const getPetTypeText = (type: PetType) => {
    const config = {
      [PetType.CAT]: "猫",
      [PetType.DOG]: "狗",
      [PetType.OTHER]: "其他",
    };
    return config[type] || "未知";
  };

  // 获取性别文本
  const getGenderText = (gender: PetGender) => {
    const config = {
      [PetGender.MALE]: "公",
      [PetGender.FEMALE]: "母",
      [PetGender.UNKNOWN]: "未知",
    };
    return config[gender] || "未知";
  };

  // 表格列定义
  const columns: TableProps<Customer>["columns"] = [
    {
      title: "客户信息",
      key: "customer",
      width: 180,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={48}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff", flexShrink: 0 }}
          >
            {record.name.charAt(0)}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "手机号",
      key: "phone",
      width: 130,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: 13,
          }}
        >
          <PhoneOutlined style={{ color: "#1890ff" }} />
          {record.phone.replace(/\D/g, "").slice(-11)}
        </div>
      ),
    },
    {
      title: "客户类型",
      key: "memberLevel",
      width: 110,
      align: "center",
      render: (_, record) => {
        const config = getMemberLevelTag(record.memberLevel);
        return (
          <Tag
            color={config.color}
            icon={
              record.memberLevel !== MemberLevel.REGULAR ? (
                <CrownOutlined />
              ) : undefined
            }
            style={{ fontSize: 13, padding: "4px 12px" }}
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "余额",
      key: "memberBalance",
      width: 110,
      align: "center",
      sorter: (a, b) => a.memberBalance - b.memberBalance,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            justifyContent: "center",
          }}
        >
          <WalletOutlined style={{ color: "#52c41a" }} />
          <span style={{ fontWeight: 600, color: "#52c41a" }}>
            ¥{(record.memberBalance / 100).toFixed(0)}
          </span>
        </div>
      ),
    },
    {
      title: "积分",
      key: "memberPoints",
      width: 90,
      align: "center",
      sorter: (a, b) => a.memberPoints - b.memberPoints,
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: "#faad14" }}>
          {record.memberPoints}
        </span>
      ),
    },
    {
      title: "宠物信息",
      key: "pets",
      width: 250,
      render: (_, record) => {
        if (!record.pets || record.pets.length === 0) {
          return (
            <Tag color="default" icon={<TeamOutlined />}>
              暂无宠物
            </Tag>
          );
        }

        return (
          <Space size={[4, 4]} wrap>
            {record.pets.slice(0, 3).map((pet) => (
              <Tooltip
                key={pet.id}
                title={`${pet.breed} · ${pet.age}岁`}
                placement="top"
              >
                <Tag
                  color="blue"
                  style={{
                    cursor: "pointer",
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <Avatar
                    size={16}
                    src={pet.imageUrl ? assetUrl(pet.imageUrl) : undefined}
                    style={{ marginRight: 4 }}
                  >
                    🐾
                  </Avatar>
                  {pet.name}
                </Tag>
              </Tooltip>
            ))}
            {record.pets.length > 3 && (
              <Tag color="default">+{record.pets.length - 3}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      width: 260,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              style={{ padding: "0 4px" }}
            >
              查看
            </Button>
          </Tooltip>
          <Tooltip title="编辑客户">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ padding: "0 4px" }}
            >
              编辑
            </Button>
          </Tooltip>
          <Tooltip title="会员升级">
            <Button
              type="link"
              size="small"
              icon={<CrownOutlined />}
              onClick={() => handleUpgrade(record)}
              style={{ padding: "0 4px" }}
            >
              升级
            </Button>
          </Tooltip>
          <Tooltip title="充值">
            <Button
              type="link"
              size="small"
              icon={<WalletOutlined />}
              onClick={() => handleRecharge(record)}
              style={{ padding: "0 4px" }}
            >
              充值
            </Button>
          </Tooltip>
          <Tooltip title="积分">
            <Button
              type="link"
              size="small"
              icon={<GiftOutlined />}
              onClick={() => handlePoints(record)}
              style={{ padding: "0 4px" }}
            >
              积分
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="客户总数"
              value={totalCustomers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="VIP会员"
              value={vipMembers}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总储值余额"
              value={totalBalance / 100}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总积分"
              value={totalPoints}
              prefix={<GiftOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "18px", fontWeight: 600 }}>
                {CUSTOMER.TITLE}
              </span>
              <Space size="large">
                <span style={{ fontSize: 14, color: "#8c8c8c" }}>
                  宠物总数:{" "}
                  <strong style={{ color: "#52c41a" }}>{totalPets}</strong>
                </span>
                <span style={{ fontSize: 14, color: "#8c8c8c" }}>
                  有宠物客户:{" "}
                  <strong style={{ color: "#faad14" }}>
                    {customersWithPets}
                  </strong>
                </span>
              </Space>
            </div>
            <Space>
              <Button icon={<SettingOutlined />} onClick={handlePointsRules}>
                积分规则设置
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                {CUSTOMER.NEW}
              </Button>
            </Space>
          </div>
        }
        styles={{ body: { padding: "16px" } }}
      >
        {/* 搜索栏 */}
        <Space style={{ marginBottom: 12 }} size="middle">
          <Search
            placeholder="搜索客户姓名或电话..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
        </Space>

        {/* 客户表格 */}
        <Table
          columns={columns}
          dataSource={filteredCustomers || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSize: 10,
            size: "default",
          }}
          size="middle"
        />
      </Card>

      {/* 客户表单弹窗 */}
      <Modal
        title={modalMode === "create" ? CUSTOMER.NEW : CUSTOMER.EDIT}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={
          createCustomerMutation.isLoading ||
          updateCustomerMutation.isLoading ||
          createCustomerMutation.isPending ||
          updateCustomerMutation.isPending
        }
        width={800}
      >
        <Form form={form} layout="vertical">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ marginTop: 16 }}
            items={[
              {
                key: "basic",
                label: (
                  <span>
                    <UserOutlined /> 基本信息
                  </span>
                ),
                children: (
                  <div style={{ marginTop: 16 }}>
                    <Form.Item
                      name="name"
                      label={CUSTOMER.NAME}
                      rules={[
                        { required: true, message: CUSTOMER.ENTER_NAME },
                        { min: 1, message: "姓名至少1个字符" },
                        { max: 60, message: "姓名最多60个字符" },
                      ]}
                    >
                      <Input placeholder={CUSTOMER.ENTER_NAME} />
                    </Form.Item>

                    <Form.Item
                      name="phone"
                      label={CUSTOMER.PHONE}
                      rules={[
                        { required: true, message: CUSTOMER.ENTER_PHONE },
                        {
                          pattern: /^1[3-9]\d{9}$/,
                          message:
                            "请输入有效的11位手机号码（如：17888888888）",
                        },
                      ]}
                    >
                      <Input placeholder="17888888888" maxLength={11} />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: "pets",
                label: (
                  <span>
                    <TeamOutlined /> 宠物信息
                  </span>
                ),
                children: (
                  <div style={{ marginTop: 16, minHeight: 300 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <span style={{ fontSize: 14, color: "#8c8c8c" }}>
                        宠物信息（可选）
                      </span>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={handleAddPet}
                        size="small"
                      >
                        添加宠物
                      </Button>
                    </div>

                    {pets.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "48px 24px",
                          color: "#8c8c8c",
                          border: "1px dashed #d9d9d9",
                          borderRadius: "4px",
                        }}
                      >
                        暂无宠物，点击上方按钮添加
                      </div>
                    ) : (
                      <div
                        style={{
                          maxHeight: "500px",
                          overflowY: "auto",
                        }}
                      >
                        <Collapse
                          accordion
                          items={pets.map((pet, index) => ({
                            key: pet.id || index,
                            label: (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                {pet.id && (
                                  <Tag color="blue" style={{ margin: 0 }}>
                                    已存在
                                  </Tag>
                                )}
                                <span style={{ fontWeight: 500 }}>
                                  {pet.name || "未命名宠物"}
                                </span>
                                {pet.breed && (
                                  <span style={{ color: "#8c8c8c" }}>
                                    · {pet.breed}
                                  </span>
                                )}
                              </div>
                            ),
                            extra: (
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePet(index);
                                }}
                              />
                            ),
                            children: (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "16px",
                                }}
                              >
                                {/* 宠物照片 */}
                                <div>
                                  <div
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      marginBottom: 12,
                                      color: "#1890ff",
                                    }}
                                  >
                                    宠物照片
                                  </div>
                                  <Upload
                                    listType="picture-card"
                                    showUploadList={false}
                                    accept="image/jpeg,image/png,image/webp"
                                    customRequest={async ({
                                      file,
                                      onSuccess,
                                      onError,
                                    }) => {
                                      try {
                                        const url = await uploadImage(
                                          file as File,
                                        );
                                        handlePetChange(index, "imageUrl", url);
                                        onSuccess?.(url);
                                      } catch (e) {
                                        message.error("照片上传失败");
                                        onError?.(e as Error);
                                      }
                                    }}
                                  >
                                    {pet.imageUrl ? (
                                      <img
                                        src={assetUrl(pet.imageUrl)}
                                        alt="宠物照片"
                                        style={{ width: "100%" }}
                                      />
                                    ) : (
                                      <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>上传</div>
                                      </div>
                                    )}
                                  </Upload>
                                </div>

                                {/* 基本信息 */}
                                <div>
                                  <div
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      marginBottom: 12,
                                      color: "#1890ff",
                                    }}
                                  >
                                    基本信息
                                  </div>
                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                    size="middle"
                                  >
                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "12px",
                                      }}
                                    >
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: "#8c8c8c",
                                            marginBottom: 4,
                                          }}
                                        >
                                          宠物类型 *
                                        </div>
                                        <Select
                                          placeholder="宠物类型"
                                          value={pet.petType || PetType.OTHER}
                                          onChange={(value) =>
                                            handlePetChange(
                                              index,
                                              "petType",
                                              value,
                                            )
                                          }
                                          style={{ width: "100%" }}
                                        >
                                          <Option value={PetType.CAT}>
                                            🐱 猫
                                          </Option>
                                          <Option value={PetType.DOG}>
                                            🐶 狗
                                          </Option>
                                          <Option value={PetType.OTHER}>
                                            🐾 其他
                                          </Option>
                                        </Select>
                                      </div>
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: "#8c8c8c",
                                            marginBottom: 4,
                                          }}
                                        >
                                          性别 *
                                        </div>
                                        <Select
                                          placeholder="性别"
                                          value={
                                            pet.gender || PetGender.UNKNOWN
                                          }
                                          onChange={(value) =>
                                            handlePetChange(
                                              index,
                                              "gender",
                                              value,
                                            )
                                          }
                                          style={{ width: "100%" }}
                                        >
                                          <Option value={PetGender.MALE}>
                                            <ManOutlined /> 公
                                          </Option>
                                          <Option value={PetGender.FEMALE}>
                                            <WomanOutlined /> 母
                                          </Option>
                                          <Option value={PetGender.UNKNOWN}>
                                            <QuestionOutlined /> 未知
                                          </Option>
                                        </Select>
                                      </div>
                                    </div>

                                    <div>
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "#8c8c8c",
                                          marginBottom: 4,
                                        }}
                                      >
                                        宠物名称 *
                                      </div>
                                      <Input
                                        placeholder="请输入宠物名称"
                                        value={pet.name}
                                        onChange={(e) =>
                                          handlePetChange(
                                            index,
                                            "name",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>

                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1fr",
                                        gap: "12px",
                                      }}
                                    >
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: "#8c8c8c",
                                            marginBottom: 4,
                                          }}
                                        >
                                          品种 *
                                        </div>
                                        <Input
                                          placeholder="请输入品种"
                                          value={pet.breed}
                                          onChange={(e) =>
                                            handlePetChange(
                                              index,
                                              "breed",
                                              e.target.value,
                                            )
                                          }
                                        />
                                      </div>
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: "#8c8c8c",
                                            marginBottom: 4,
                                          }}
                                        >
                                          年龄 *
                                        </div>
                                        <InputNumber
                                          placeholder="年龄"
                                          value={pet.age || 0}
                                          onChange={(value) =>
                                            handlePetChange(
                                              index,
                                              "age",
                                              value || 0,
                                            )
                                          }
                                          style={{ width: "100%" }}
                                          min={0}
                                          suffix="岁"
                                        />
                                      </div>
                                    </div>

                                    <div
                                      style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "12px",
                                      }}
                                    >
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: "#8c8c8c",
                                            marginBottom: 4,
                                          }}
                                        >
                                          生日
                                        </div>
                                        <DatePicker
                                          placeholder="请选择生日"
                                          value={
                                            pet.birthday
                                              ? dayjs(pet.birthday)
                                              : null
                                          }
                                          onChange={(date) =>
                                            handlePetChange(
                                              index,
                                              "birthday",
                                              date ? date.toISOString() : null,
                                            )
                                          }
                                          style={{ width: "100%" }}
                                        />
                                      </div>
                                      <div>
                                        <div
                                          style={{
                                            fontSize: 12,
                                            color: "#8c8c8c",
                                            marginBottom: 4,
                                          }}
                                        >
                                          是否绝育
                                        </div>
                                        <Switch
                                          checked={pet.isNeutered || false}
                                          onChange={(checked) =>
                                            handlePetChange(
                                              index,
                                              "isNeutered",
                                              checked,
                                            )
                                          }
                                          checkedChildren="已绝育"
                                          unCheckedChildren="未绝育"
                                        />
                                      </div>
                                    </div>
                                  </Space>
                                </div>

                                <Divider style={{ margin: "8px 0" }} />

                                {/* 健康信息 */}
                                <div>
                                  <div
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 600,
                                      marginBottom: 12,
                                      color: "#52c41a",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <MedicineBoxOutlined />
                                    健康信息（可选）
                                  </div>
                                  <Space
                                    direction="vertical"
                                    style={{ width: "100%" }}
                                    size="middle"
                                  >
                                    <div>
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "#8c8c8c",
                                          marginBottom: 4,
                                        }}
                                      >
                                        疫苗情况
                                      </div>
                                      <Input.TextArea
                                        rows={2}
                                        placeholder="如：狂犬疫苗（2023-01-15）、三联疫苗（2023-02-20）"
                                        value={pet.vaccineInfo || ""}
                                        onChange={(e) =>
                                          handlePetChange(
                                            index,
                                            "vaccineInfo",
                                            e.target.value || null,
                                          )
                                        }
                                      />
                                    </div>

                                    <div>
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "#8c8c8c",
                                          marginBottom: 4,
                                        }}
                                      >
                                        过敏史
                                      </div>
                                      <Input.TextArea
                                        rows={2}
                                        placeholder="如：对鸡肉过敏、对某些药物过敏等"
                                        value={pet.allergyHistory || ""}
                                        onChange={(e) =>
                                          handlePetChange(
                                            index,
                                            "allergyHistory",
                                            e.target.value || null,
                                          )
                                        }
                                      />
                                    </div>

                                    <div>
                                      <div
                                        style={{
                                          fontSize: 12,
                                          color: "#8c8c8c",
                                          marginBottom: 4,
                                        }}
                                      >
                                        <WarningOutlined
                                          style={{ marginRight: 4 }}
                                        />
                                        注意事项
                                      </div>
                                      <Input.TextArea
                                        rows={2}
                                        placeholder="如：心脏病需定期检查、关节炎需注意运动等"
                                        value={pet.healthNotes || ""}
                                        onChange={(e) =>
                                          handlePetChange(
                                            index,
                                            "healthNotes",
                                            e.target.value || null,
                                          )
                                        }
                                      />
                                    </div>
                                  </Space>
                                </div>
                              </div>
                            ),
                          }))}
                        />
                      </div>
                    )}
                  </div>
                ),
              },
              ...(modalMode === "create"
                ? [
                    {
                      key: "member",
                      label: (
                        <span>
                          <CrownOutlined /> 会员信息
                        </span>
                      ),
                      children: (
                        <div style={{ marginTop: 16 }}>
                          <Form.Item
                            name="memberLevel"
                            label="会员等级"
                            tooltip="选择会员等级，默认为普通客户"
                          >
                            <Select>
                              <Option value={MemberLevel.REGULAR}>
                                <IdcardOutlined /> {MEMBER.LEVEL_REGULAR}
                              </Option>
                              <Option value={MemberLevel.VIP}>
                                <CrownOutlined /> {MEMBER.LEVEL_VIP}
                              </Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                              prevValues.memberLevel !==
                              currentValues.memberLevel
                            }
                          >
                            {() => null}
                          </Form.Item>

                          <Divider style={{ margin: "16px 0" }} />

                          <Form.Item
                            name="initialRecharge"
                            label="初始充值金额（元）"
                            tooltip="可选，为新客户充值储值余额"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              precision={2}
                              placeholder="0.00"
                              prefix={<WalletOutlined />}
                            />
                          </Form.Item>

                          <Form.Item
                            name="initialPoints"
                            label="赠送积分"
                            tooltip="可选，为新客户赠送积分"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              min={0}
                              placeholder="0"
                              prefix={<GiftOutlined />}
                            />
                          </Form.Item>

                          <div
                            style={{
                              padding: "12px",
                              background: "#f0f5ff",
                              borderRadius: "6px",
                              marginTop: "16px",
                            }}
                          >
                            <div style={{ fontSize: "13px", color: "#1890ff" }}>
                              <strong>💡 提示：</strong>
                              <br />
                              会员信息为可选项，如果客户暂不办理会员卡，保持默认"普通客户"即可。
                              <br />
                              办理会员卡后即为终身会员，可享受会员专属权益。
                              <br />
                              后续可在客户列表中进行充值和积分操作。
                            </div>
                          </div>
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </Form>
      </Modal>

      {/* 客户详情弹窗 */}
      <Modal
        title="客户详情"
        open={detailModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedCustomer && (
          <div>
            {/* 基本信息 */}
            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={2} size="small">
                <Descriptions.Item label="姓名">
                  {selectedCustomer.name}
                </Descriptions.Item>
                <Descriptions.Item label="手机号">
                  {selectedCustomer.phone.replace(/\D/g, "").slice(-11)}
                </Descriptions.Item>
                <Descriptions.Item label="客户等级">
                  <Tag
                    color={
                      getMemberLevelTag(selectedCustomer.memberLevel).color
                    }
                  >
                    {getMemberLevelTag(selectedCustomer.memberLevel).text}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="注册时间">
                  {dayjs(selectedCustomer.createdAt).format("YYYY-MM-DD HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="会员积分">
                  <span style={{ color: "#faad14", fontWeight: 600 }}>
                    {selectedCustomer.memberPoints}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="储值余额">
                  <span style={{ color: "#52c41a", fontWeight: 600 }}>
                    ¥{(selectedCustomer.memberBalance / 100).toFixed(2)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="累计消费">
                  <span style={{ color: "#ff4d4f", fontWeight: 600 }}>
                    ¥{(selectedCustomer.totalSpent / 100).toFixed(2)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="最近到店">
                  {selectedCustomer.lastVisitAt
                    ? dayjs(selectedCustomer.lastVisitAt).format("YYYY-MM-DD")
                    : "未到店"}
                </Descriptions.Item>
                {selectedCustomer.notes && (
                  <Descriptions.Item label="备注" span={2}>
                    {selectedCustomer.notes}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* 宠物信息 - 完整展示 */}
            <Card title="宠物信息" size="small">
              {selectedCustomer.pets.length === 0 ? (
                <Empty description="暂无宠物信息" />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {selectedCustomer.pets.map((pet) => (
                    <Card
                      key={pet.id}
                      size="small"
                      style={{ backgroundColor: "#fafafa" }}
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Avatar
                            size={40}
                            src={
                              pet.imageUrl ? assetUrl(pet.imageUrl) : undefined
                            }
                            icon={<HeartOutlined />}
                          />
                          <span style={{ fontSize: 16, fontWeight: 600 }}>
                            {pet.name}
                          </span>
                          <Tag color="blue">{getPetTypeText(pet.petType)}</Tag>
                        </div>
                      }
                    >
                      {/* 基本信息 */}
                      <div style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            marginBottom: 8,
                            color: "#1890ff",
                          }}
                        >
                          基本信息
                        </div>
                        <Descriptions column={3} size="small">
                          <Descriptions.Item label="品种">
                            {pet.breed}
                          </Descriptions.Item>
                          <Descriptions.Item label="年龄">
                            {pet.age} 岁
                          </Descriptions.Item>
                          <Descriptions.Item label="性别">
                            <Tag
                              color={
                                pet.gender === PetGender.MALE
                                  ? "blue"
                                  : pet.gender === PetGender.FEMALE
                                    ? "pink"
                                    : "default"
                              }
                            >
                              {pet.gender === PetGender.MALE && <ManOutlined />}
                              {pet.gender === PetGender.FEMALE && (
                                <WomanOutlined />
                              )}
                              {pet.gender === PetGender.UNKNOWN && (
                                <QuestionOutlined />
                              )}{" "}
                              {getGenderText(pet.gender)}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="生日">
                            {pet.birthday
                              ? dayjs(pet.birthday).format("YYYY-MM-DD")
                              : "未设置"}
                          </Descriptions.Item>
                          <Descriptions.Item label="绝育状态">
                            <Tag color={pet.isNeutered ? "green" : "default"}>
                              {pet.isNeutered ? (
                                <>
                                  <HeartOutlined /> 已绝育
                                </>
                              ) : (
                                "未绝育"
                              )}
                            </Tag>
                          </Descriptions.Item>
                          <Descriptions.Item label="最近洗护">
                            {pet.lastGroomingAt
                              ? dayjs(pet.lastGroomingAt).format("YYYY-MM-DD")
                              : "无记录"}
                          </Descriptions.Item>
                        </Descriptions>
                      </div>

                      {/* 健康信息 */}
                      {(pet.vaccineInfo ||
                        pet.allergyHistory ||
                        pet.healthNotes) && (
                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              marginBottom: 8,
                              color: "#52c41a",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <MedicineBoxOutlined />
                            健康信息
                          </div>
                          <Descriptions column={1} size="small">
                            {pet.vaccineInfo && (
                              <Descriptions.Item label="疫苗情况">
                                {pet.vaccineInfo}
                              </Descriptions.Item>
                            )}
                            {pet.allergyHistory && (
                              <Descriptions.Item label="过敏史">
                                <span style={{ color: "#ff4d4f" }}>
                                  <WarningOutlined style={{ marginRight: 4 }} />
                                  {pet.allergyHistory}
                                </span>
                              </Descriptions.Item>
                            )}
                            {pet.healthNotes && (
                              <Descriptions.Item label="注意事项">
                                <span style={{ color: "#faad14" }}>
                                  <WarningOutlined style={{ marginRight: 4 }} />
                                  {pet.healthNotes}
                                </span>
                              </Descriptions.Item>
                            )}
                          </Descriptions>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {/* 消费记录 */}
            <Card title="消费记录" size="small" style={{ marginTop: 16 }}>
              {isLoadingConsumption ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Empty description="加载中..." />
                </div>
              ) : consumptionData && consumptionData.records.length > 0 ? (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {consumptionData.records.map((record) => (
                    <Card
                      key={record.id}
                      size="small"
                      style={{ marginBottom: 8 }}
                      bodyStyle={{ padding: "12px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: 4 }}>
                            <Tag
                              color={
                                record.type === "PRODUCT" ? "blue" : "green"
                              }
                            >
                              {record.type === "PRODUCT" ? "商品" : "服务"}
                            </Tag>
                            <Tag>{record.status}</Tag>
                          </div>
                          <div style={{ marginBottom: 4 }}>
                            {record.items.map((item, idx) => (
                              <div key={idx} style={{ color: "#666" }}>
                                {item}
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            {dayjs(record.date).format("YYYY-MM-DD HH:mm")}
                          </div>
                          {record.note && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "#999",
                                marginTop: 4,
                              }}
                            >
                              备注：{record.note}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#52c41a",
                            marginLeft: 16,
                          }}
                        >
                          ¥{(record.amount / 100).toFixed(2)}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {consumptionData.total > 10 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "8px",
                        color: "#999",
                      }}
                    >
                      仅显示最近10条记录，共{consumptionData.total}条
                    </div>
                  )}
                </div>
              ) : (
                <Empty description="暂无消费记录" />
              )}
            </Card>
          </div>
        )}
      </Modal>

      {/* 升级会员弹窗 */}
      <Modal
        title={MEMBER.UPGRADE}
        open={upgradeModalVisible}
        onOk={handleUpgradeSubmit}
        onCancel={() => {
          setUpgradeModalVisible(false);
          upgradeForm.resetFields();
          setSelectedCustomer(null);
        }}
        confirmLoading={updateCustomerMutation.isLoading}
      >
        <Form form={upgradeForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="memberLevel"
            label={MEMBER.LEVEL}
            rules={[{ required: true, message: MEMBER.SELECT_LEVEL }]}
          >
            <Select>
              <Option value={MemberLevel.REGULAR}>
                {MEMBER.LEVEL_REGULAR}
              </Option>
              <Option value={MemberLevel.VIP}>{MEMBER.LEVEL_VIP}</Option>
            </Select>
          </Form.Item>

          <div
            style={{
              padding: "12px",
              background: "#f0f5ff",
              borderRadius: "6px",
              marginTop: "16px",
            }}
          >
            <div style={{ fontSize: "13px", color: "#1890ff" }}>
              <strong>💡 提示：</strong>
              <br />
              会员升级后即为终身会员，可享受对应等级的专属权益。
            </div>
          </div>
        </Form>
      </Modal>

      {/* 充值弹窗 */}
      <Modal
        title={MEMBER.RECHARGE}
        open={rechargeModalVisible}
        onOk={showRechargeHistory ? undefined : handleRechargeSubmit}
        onCancel={() => {
          setRechargeModalVisible(false);
          setShowRechargeHistory(false);
          rechargeForm.resetFields();
          setSelectedCustomer(null);
        }}
        confirmLoading={updateCustomerMutation.isLoading}
        footer={
          showRechargeHistory
            ? [
                <Button
                  key="back"
                  onClick={() => setShowRechargeHistory(false)}
                >
                  返回充值
                </Button>,
                <Button
                  key="close"
                  onClick={() => {
                    setRechargeModalVisible(false);
                    setShowRechargeHistory(false);
                    rechargeForm.resetFields();
                    setSelectedCustomer(null);
                  }}
                >
                  关闭
                </Button>,
              ]
            : undefined
        }
        width={showRechargeHistory ? 700 : 520}
      >
        {showRechargeHistory ? (
          <RechargeHistoryTable customerId={selectedCustomer?.id || ""} />
        ) : (
          <>
            <Form
              form={rechargeForm}
              layout="vertical"
              style={{ marginTop: 24 }}
            >
              <Form.Item
                name="amount"
                label="充值金额（元）"
                rules={[
                  { required: true, message: MEMBER.ENTER_AMOUNT },
                  { type: "number", min: 0.01, message: "金额必须大于0" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  precision={2}
                  min={0.01}
                  placeholder="请输入充值金额"
                />
              </Form.Item>

              <Form.Item name="note" label="备注（可选）">
                <Input.TextArea
                  rows={2}
                  placeholder="请输入备注信息"
                  maxLength={200}
                />
              </Form.Item>
            </Form>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Button
                type="link"
                icon={<HistoryOutlined />}
                onClick={() => setShowRechargeHistory(true)}
              >
                查看充值记录
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* 积分操作弹窗 */}
      <Modal
        title={MEMBER.POINTS}
        open={pointsModalVisible}
        onOk={showPointsHistory ? undefined : handlePointsSubmit}
        onCancel={() => {
          setPointsModalVisible(false);
          setShowPointsHistory(false);
          pointsForm.resetFields();
          setSelectedCustomer(null);
        }}
        confirmLoading={updateCustomerMutation.isLoading}
        footer={
          showPointsHistory
            ? [
                <Button key="back" onClick={() => setShowPointsHistory(false)}>
                  返回积分操作
                </Button>,
                <Button
                  key="close"
                  onClick={() => {
                    setPointsModalVisible(false);
                    setShowPointsHistory(false);
                    pointsForm.resetFields();
                    setSelectedCustomer(null);
                  }}
                >
                  关闭
                </Button>,
              ]
            : undefined
        }
        width={showPointsHistory ? 700 : 520}
      >
        {showPointsHistory ? (
          <PointsHistoryTable customerId={selectedCustomer?.id || ""} />
        ) : (
          <>
            <Form form={pointsForm} layout="vertical" style={{ marginTop: 24 }}>
              <Form.Item
                name="action"
                label="操作类型"
                rules={[{ required: true, message: "请选择操作类型" }]}
              >
                <Select>
                  <Option value="add">{MEMBER.ADD_POINTS}</Option>
                  <Option value="deduct">{MEMBER.DEDUCT_POINTS}</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="points"
                label="积分数量"
                rules={[
                  { required: true, message: MEMBER.ENTER_POINTS },
                  { type: "number", min: 1, message: "积分必须大于0" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="请输入积分数量"
                />
              </Form.Item>

              <Form.Item name="reason" label="原因说明（可选）">
                <Input.TextArea
                  rows={2}
                  placeholder="请输入原因说明"
                  maxLength={200}
                />
              </Form.Item>
            </Form>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Button
                type="link"
                icon={<HistoryOutlined />}
                onClick={() => setShowPointsHistory(true)}
              >
                查看积分记录
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* 积分规则设置弹窗 */}
      <Modal
        title="积分规则设置"
        open={pointsRulesVisible}
        onOk={handlePointsRulesSubmit}
        onCancel={() => {
          setPointsRulesVisible(false);
          pointsRulesForm.resetFields();
        }}
        width={500}
      >
        <Form
          form={pointsRulesForm}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="consumptionAmount"
            label="消费金额（元）"
            rules={[
              { required: true, message: "请输入消费金额" },
              { type: "number", min: 1, message: "金额必须大于0" },
            ]}
            extra="每消费多少元可获得积分"
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="例如：100"
            />
          </Form.Item>

          <Form.Item
            name="pointsEarned"
            label="获得积分"
            rules={[
              { required: true, message: "请输入获得积分" },
              { type: "number", min: 1, message: "积分必须大于0" },
            ]}
            extra="消费达到金额后可获得的积分数"
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="例如：10"
            />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="是否启用"
            valuePropName="checked"
            extra="关闭后将不会自动累积积分"
          >
            <Select>
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
            </Select>
          </Form.Item>

          <div
            style={{
              padding: "12px",
              background: "#f0f5ff",
              borderRadius: "6px",
              marginTop: "16px",
            }}
          >
            <div style={{ fontSize: "13px", color: "#1890ff" }}>
              <strong>规则说明：</strong>
              <br />
              当前设置为：每消费{" "}
              <strong>
                {pointsRulesForm.getFieldValue("consumptionAmount") || 100}
              </strong>{" "}
              元，可获得{" "}
              <strong>
                {pointsRulesForm.getFieldValue("pointsEarned") || 10}
              </strong>{" "}
              积分
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
