"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Modal,
  Tag,
  Card,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  DatePicker,
  Avatar,
  Form,
  InputNumber,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ScissorOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { Appointment, AppointmentStatus } from "@/@types/Appointment";
import { ServiceCategory } from "@/@types/PetshopServices";
import { PetType, PetGender } from "@/@types/Pet";
import {
  fetchAppointments,
  updateAppointmentStatus,
  reviewAppointment,
  createAppointment,
  APPOINTMENT_KEY,
} from "@/services/queries/Appointment";
import {
  fetchCustomers,
  createCustomer,
  addCustomerPet,
  CUSTOMER_KEY,
} from "@/services/queries/Customer";
import {
  fetchPetshopServices,
  PETSHOPSERVICE_KEY,
} from "@/services/queries/PetshopServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { AxiosError } from "axios";
import { APIError } from "@/@types/API";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const DATE_FORMAT = "YYYY-MM-DD HH:mm";

function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<APIError>;
  return axiosError?.response?.data?.message || "操作失败，请重试";
}

export default function Appointments() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">(
    "ALL",
  );
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingAppointmentId, setEditingAppointmentId] = useState<
    string | null
  >(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [form] = Form.useForm();
  const [customerForm] = Form.useForm();
  const [petForm] = Form.useForm();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingAppointment, setRejectingAppointment] =
    useState<Appointment | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // 查询订单列表
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: [APPOINTMENT_KEY, dateRange],
    queryFn: () =>
      fetchAppointments({
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
        page: 1,
        pageSize: 1000,
      }),
  });

  // 查询客户列表
  const { data: customersData } = useQuery({
    queryKey: [CUSTOMER_KEY],
    queryFn: fetchCustomers,
  });

  // 查询服务列表
  const { data: servicesData } = useQuery({
    queryKey: [PETSHOPSERVICE_KEY],
    queryFn: fetchPetshopServices,
  });

  // 创建订单
  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      message.success("订单创建成功");
      queryClient.invalidateQueries({ queryKey: [APPOINTMENT_KEY] });
      handleCloseFormModal();
    },
    onError: () => {
      message.error("订单创建失败，请重试");
    },
  });

  // 创建客户
  const createCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async (data) => {
      message.success("客户创建成功");
      // 等待查询刷新完成
      await queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
      // 自动选择新创建的客户
      form.setFieldsValue({ customerId: data.customer.id });
      setSelectedCustomerId(data.customer.id);
      setCustomerModalVisible(false);
      customerForm.resetFields();
    },
    onError: () => {
      message.error("客户创建失败，请重试");
    },
  });

  // 创建宠物
  const createPetMutation = useMutation({
    mutationFn: ({
      customerId,
      petData,
    }: {
      customerId: string;
      petData: any;
    }) => addCustomerPet(customerId, petData),
    onSuccess: async (data) => {
      message.success("宠物创建成功");
      // 等待查询刷新完成
      await queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] });
      // 自动选择新创建的宠物
      form.setFieldsValue({ petId: data.pet.id });
      setPetModalVisible(false);
      petForm.resetFields();
    },
    onError: () => {
      message.error("宠物创建失败，请重试");
    },
  });

  // 更新订单状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      message.success("订单状态更新成功");
      queryClient.invalidateQueries({ queryKey: [APPOINTMENT_KEY] });
    },
    onError: () => {
      message.error("订单状态更新失败，请重试");
    },
  });

  // 审核预约（通过/拒绝）
  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      action,
      rejectReason,
    }: {
      id: string;
      action: "CONFIRM" | "REJECT";
      rejectReason?: string;
    }) => reviewAppointment(id, action, rejectReason),
    onSuccess: (_data, variables) => {
      message.success(
        variables.action === "CONFIRM" ? "预约已通过" : "预约已拒绝",
      );
      queryClient.invalidateQueries({ queryKey: [APPOINTMENT_KEY] });
    },
    onError: (error) => {
      message.error(extractErrorMessage(error));
    },
  });

  // 过滤订单数据
  const filteredAppointments =
    appointmentsData?.appointments?.filter((appointment) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchSearch =
          appointment.pet.name.toLowerCase().includes(searchLower) ||
          appointment.service?.title.toLowerCase().includes(searchLower);
        if (!matchSearch) return false;
      }
      if (statusFilter !== "ALL" && appointment.status !== statusFilter) {
        return false;
      }
      return true;
    }) || [];

  // 统计数据
  const totalAppointments = appointmentsData?.appointments?.length || 0;
  const pendingCount =
    appointmentsData?.appointments?.filter(
      (a) => a.status === AppointmentStatus.PENDING,
    ).length || 0;
  const doneCount =
    appointmentsData?.appointments?.filter(
      (a) =>
        a.status === AppointmentStatus.DONE ||
        a.status === AppointmentStatus.PENDING_PAYMENT,
    ).length || 0;
  const completedCount =
    appointmentsData?.appointments?.filter(
      (a) => a.status === AppointmentStatus.COMPLETED,
    ).length || 0;
  const canceledCount =
    appointmentsData?.appointments?.filter(
      (a) => a.status === AppointmentStatus.CANCELED,
    ).length || 0;

  // 获取客户的宠物列表
  const getCustomerPets = (customerId?: string) => {
    if (!customerId) return [];
    const customer = customersData?.customers.find((c) => c.id === customerId);
    return customer?.pets || [];
  };

  // 获取服务分类配置（分类已改为数据表，按名称展示）
  const getCategoryConfig = (category?: ServiceCategory | null) => {
    if (!category) return { text: "-", color: "default", icon: null };
    return { text: category.name, color: "blue", icon: null };
  };

  // 获取状态配置
  const getStatusConfig = (status: AppointmentStatus) => {
    const config = {
      [AppointmentStatus.PENDING]: {
        text: "待审核",
        color: "processing",
        icon: <ClockCircleOutlined />,
      },
      [AppointmentStatus.CONFIRMED]: {
        text: "已确认",
        color: "success",
        icon: <CheckCircleOutlined />,
      },
      [AppointmentStatus.REJECTED]: {
        text: "已拒绝",
        color: "error",
        icon: <CloseCircleOutlined />,
      },
      [AppointmentStatus.DONE]: {
        text: "待支付",
        color: "warning",
        icon: <ClockCircleOutlined />,
      },
      [AppointmentStatus.PENDING_PAYMENT]: {
        text: "待支付",
        color: "warning",
        icon: <ClockCircleOutlined />,
      },
      [AppointmentStatus.COMPLETED]: {
        text: "已完成",
        color: "success",
        icon: <CheckCircleOutlined />,
      },
      [AppointmentStatus.CANCELED]: {
        text: "已取消",
        color: "default",
        icon: <CloseCircleOutlined />,
      },
    };
    return config[status];
  };

  // 打开创建弹窗
  const handleCreate = () => {
    setModalMode("create");
    setEditingAppointmentId(null);
    setSelectedCustomerId(undefined);
    form.resetFields();
    setFormModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (appointment: Appointment) => {
    setModalMode("edit");
    setEditingAppointmentId(appointment.id);
    setSelectedCustomerId(appointment.pet.ownerId);
    form.setFieldsValue({
      customerId: appointment.pet.ownerId,
      petId: appointment.pet.id,
      serviceId: appointment.service?.id,
      appointmentTime: dayjs(appointment.appointmentTime),
    });
    setFormModalVisible(true);
  };

  // 关闭表单弹窗
  const handleCloseFormModal = () => {
    setFormModalVisible(false);
    form.resetFields();
    setEditingAppointmentId(null);
    setSelectedCustomerId(undefined);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const appointmentData = {
        petId: values.petId,
        serviceId: values.serviceId,
        appointmentTime: new Date(dayjs(values.appointmentTime).toISOString()),
      };

      if (modalMode === "create") {
        await createMutation.mutateAsync(appointmentData);
      } else {
        // 编辑功能暂时不实现，因为后端没有更新订单的API
        message.info("编辑功能暂未实现");
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 处理客户选择变化
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    form.setFieldsValue({ petId: undefined });
  };

  // 打开新建客户弹窗
  const handleOpenCustomerModal = () => {
    customerForm.resetFields();
    setCustomerModalVisible(true);
  };

  // 提交新建客户
  const handleCreateCustomer = async () => {
    try {
      const values = await customerForm.validateFields();
      await createCustomerMutation.mutateAsync({
        name: values.name,
        phone: `+559${values.phone}`,
        pets: [], // 空数组，因为是快速创建
      });
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 打开新建宠物弹窗
  const handleOpenPetModal = () => {
    if (!selectedCustomerId) {
      message.warning("请先选择客户");
      return;
    }
    petForm.resetFields();
    setPetModalVisible(true);
  };

  // 提交新建宠物
  const handleCreatePet = async () => {
    if (!selectedCustomerId) {
      message.error("请先选择客户");
      return;
    }
    try {
      const values = await petForm.validateFields();
      await createPetMutation.mutateAsync({
        customerId: selectedCustomerId,
        petData: {
          name: values.name,
          breed: values.breed,
          age: values.age,
          petType: values.petType,
          gender: values.gender || PetGender.UNKNOWN,
          isNeutered: values.isNeutered || false,
        },
      });
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 处理状态变更
  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    Modal.confirm({
      title: "确认更改状态",
      content: `确定要将订单状态更改为"${getStatusConfig(status).text}"吗？`,
      okText: "确认",
      cancelText: "取消",
      onOk: () => updateStatusMutation.mutate({ id, status }),
    });
  };

  // 审核通过
  const handleConfirm = (appointment: Appointment) => {
    Modal.confirm({
      title: "确认通过预约",
      content: `确定通过「${appointment.pet.name}」的预约审核吗？`,
      okText: "通过",
      cancelText: "取消",
      onOk: () =>
        reviewMutation.mutate({ id: appointment.id, action: "CONFIRM" }),
    });
  };

  // 打开拒绝弹窗
  const handleOpenRejectModal = (appointment: Appointment) => {
    setRejectingAppointment(appointment);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  // 提交拒绝
  const handleSubmitReject = async () => {
    if (!rejectingAppointment) return;
    if (!rejectReason.trim()) {
      message.warning("请填写拒绝理由");
      return;
    }
    try {
      await reviewMutation.mutateAsync({
        id: rejectingAppointment.id,
        action: "REJECT",
        rejectReason: rejectReason.trim(),
      });
      setRejectModalVisible(false);
      setRejectingAppointment(null);
      setRejectReason("");
    } catch {
      // 错误已由 reviewMutation 的 onError 提示
    }
  };

  // 跳转到收银台结算
  const handleGoToCashier = (appointment: Appointment) => {
    const customer = customersData?.customers.find(
      (c) => c.id === appointment.pet.ownerId,
    );
    if (!customer || !appointment.service) {
      message.error("无法获取客户或服务信息");
      return;
    }

    // 构建URL参数
    const params = new URLSearchParams({
      appointmentId: appointment.id,
      customerId: customer.id,
      serviceName: appointment.service.title,
      servicePrice: appointment.service.value.toString(),
    });

    router.push(`/dashboard/cashier?${params.toString()}`);
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([
        dayjs(dates[0]).startOf("day").toISOString(),
        dayjs(dates[1]).endOf("day").toISOString(),
      ]);
    } else {
      setDateRange(null);
    }
  };

  // 表格列定义
  const columns: TableColumnsType<Appointment> = [
    {
      title: "预约时间",
      key: "appointmentTime",
      width: 180,
      sorter: (a, b) =>
        dayjs(a.appointmentTime).unix() - dayjs(b.appointmentTime).unix(),
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <span>{dayjs(record.appointmentTime).format(DATE_FORMAT)}</span>
        </div>
      ),
    },
    {
      title: "客户信息",
      key: "customer",
      width: 200,
      render: (_, record) => {
        const customer = customersData?.customers.find(
          (c) => c.id === record.pet.ownerId,
        );
        if (!customer) return <span style={{ color: "#8c8c8c" }}>-</span>;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              size={40}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {customer.name}
              </div>
              <div style={{ color: "#8c8c8c", fontSize: 12 }}>
                {customer.phone.slice(-11)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "宠物信息",
      key: "pet",
      width: 160,
      render: (_, record) => (
        <div>
          <div
            style={{
              fontWeight: 500,
              fontSize: 14,
              marginBottom: 2,
            }}
          >
            {record.pet.name}
          </div>
          <div style={{ color: "#8c8c8c", fontSize: 12 }}>
            {record.pet.breed}
          </div>
        </div>
      ),
    },
    {
      title: "服务项目",
      key: "service",
      width: 220,
      render: (_, record) => {
        if (!record.service) return <span style={{ color: "#8c8c8c" }}>-</span>;
        const categoryConfig = getCategoryConfig(record.service.category);
        return (
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {record.service.title}
            </div>
            <Tag
              color={categoryConfig.color}
              icon={categoryConfig.icon}
              style={{ fontSize: 12 }}
            >
              {categoryConfig.text}
            </Tag>
          </div>
        );
      },
    },
    {
      title: "金额",
      key: "value",
      width: 100,
      align: "center",
      sorter: (a, b) => (a.service?.value || 0) - (b.service?.value || 0),
      render: (_, record) =>
        record.service ? (
          <Tag
            color="green"
            style={{ fontSize: 13, padding: "4px 10px", fontWeight: 600 }}
          >
            ¥{(record.service.value / 100).toFixed(2)}
          </Tag>
        ) : (
          <span style={{ color: "#8c8c8c" }}>-</span>
        ),
    },
    {
      title: "状态",
      key: "status",
      width: 110,
      align: "center",
      render: (_, record) => {
        const statusConfig = getStatusConfig(record.status);
        return (
          <Tag color={statusConfig.color} icon={statusConfig.icon}>
            {statusConfig.text}
          </Tag>
        );
      },
    },
    {
      title: "备注 / 拒绝理由",
      key: "note",
      width: 180,
      render: (_, record) => (
        <div>
          {record.customerNote ? (
            <div style={{ color: "#8c8c8c", fontSize: 12, marginBottom: 2 }}>
              备注：{record.customerNote}
            </div>
          ) : null}
          {record.rejectReason ? (
            <div style={{ color: "#f5222d", fontSize: 12 }}>
              拒绝：{record.rejectReason}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 320,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === AppointmentStatus.PENDING && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleConfirm(record)}
              >
                通过
              </Button>
              <Button
                type="link"
                danger
                size="small"
                onClick={() => handleOpenRejectModal(record)}
              >
                拒绝
              </Button>
              <Button
                type="link"
                danger
                size="small"
                onClick={() =>
                  handleStatusChange(record.id, AppointmentStatus.CANCELED)
                }
              >
                取消
              </Button>
            </>
          )}
          {record.status === AppointmentStatus.CONFIRMED && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() =>
                  handleStatusChange(record.id, AppointmentStatus.COMPLETED)
                }
              >
                完成服务
              </Button>
              <Button
                type="link"
                danger
                size="small"
                onClick={() =>
                  handleStatusChange(record.id, AppointmentStatus.CANCELED)
                }
              >
                取消
              </Button>
            </>
          )}
          {(record.status === AppointmentStatus.DONE ||
            record.status === AppointmentStatus.PENDING_PAYMENT) &&
            record.service && (
              <Button
                type="primary"
                size="small"
                onClick={() => handleGoToCashier(record)}
              >
                去收银台
              </Button>
            )}
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
              title="订单总数"
              value={totalAppointments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待支付"
              value={doneCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={completedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
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
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              服务订单管理
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新建订单
            </Button>
          </div>
        }
        styles={{ body: { padding: "16px" } }}
      >
        {/* 搜索和筛选栏 */}
        <Space style={{ marginBottom: 12 }} size="middle">
          <Search
            placeholder="搜索宠物名称或服务项目..."
            allowClear
            onSearch={setSearch}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <RangePicker
            onChange={handleDateRangeChange}
            format="YYYY-MM-DD"
            placeholder={["开始日期", "结束日期"]}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
          >
            <Option value="ALL">全部状态</Option>
            <Option value={AppointmentStatus.PENDING}>
              <ClockCircleOutlined /> 待审核
            </Option>
            <Option value={AppointmentStatus.CONFIRMED}>
              <CheckCircleOutlined /> 已确认
            </Option>
            <Option value={AppointmentStatus.REJECTED}>
              <CloseCircleOutlined /> 已拒绝
            </Option>
            <Option value={AppointmentStatus.DONE}>
              <ClockCircleOutlined /> 待支付
            </Option>
            <Option value={AppointmentStatus.COMPLETED}>
              <CheckCircleOutlined /> 已完成
            </Option>
            <Option value={AppointmentStatus.CANCELED}>
              <CloseCircleOutlined /> 已取消
            </Option>
          </Select>
        </Space>

        {/* 订单表格 */}
        <Table
          columns={columns}
          dataSource={filteredAppointments}
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

      {/* 订单表单弹窗 */}
      <Modal
        title={modalMode === "create" ? "新建订单" : "编辑订单"}
        open={formModalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseFormModal}
        confirmLoading={createMutation.isLoading}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="customerId"
            label={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>选择客户</span>
                <Button
                  type="link"
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={handleOpenCustomerModal}
                  style={{ padding: 0 }}
                >
                  新建客户
                </Button>
              </div>
            }
            rules={[{ required: true, message: "请选择客户" }]}
          >
            <Select
              placeholder="请选择客户"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={handleCustomerChange}
              options={customersData?.customers.map((customer) => ({
                label: `${customer.name} - ${customer.phone.slice(-11)}`,
                value: customer.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="petId"
            label={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>选择宠物</span>
                <Button
                  type="link"
                  size="small"
                  icon={<PlusCircleOutlined />}
                  onClick={handleOpenPetModal}
                  disabled={!selectedCustomerId}
                  style={{ padding: 0 }}
                >
                  新建宠物
                </Button>
              </div>
            }
            rules={[{ required: true, message: "请选择宠物" }]}
          >
            <Select
              placeholder="请先选择客户"
              disabled={!selectedCustomerId}
              options={getCustomerPets(selectedCustomerId).map((pet) => ({
                label: `${pet.name} - ${pet.breed}`,
                value: pet.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="serviceId"
            label="选择服务"
            rules={[{ required: true, message: "请选择服务" }]}
          >
            <Select
              placeholder="请选择服务项目"
              showSearch
              optionFilterProp="label"
            >
              {servicesData?.services
                .filter((s) => s.status === "ACTIVE")
                .map((service) => (
                  <Option
                    key={service.id}
                    value={service.id}
                    label={`${service.title} - ${getCategoryConfig(service.category).text}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>
                        {service.title} -{" "}
                        {getCategoryConfig(service.category).text}
                      </span>
                      <Tag color="green">
                        ¥{(service.value / 100).toFixed(2)}
                      </Tag>
                    </div>
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="appointmentTime"
            label="预约时间"
            rules={[
              { required: true, message: "请选择预约时间" },
              {
                validator: (_, value) => {
                  if (value && dayjs(value).isBefore(dayjs())) {
                    return Promise.reject(
                      new Error("预约时间不能早于当前时间"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: "100%" }}
              placeholder="请选择预约时间"
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day");
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 快速新建客户弹窗 */}
      <Modal
        title="快速新建客户"
        open={customerModalVisible}
        onOk={handleCreateCustomer}
        onCancel={() => {
          setCustomerModalVisible(false);
          customerForm.resetFields();
        }}
        confirmLoading={createCustomerMutation.isLoading}
        width={500}
      >
        <Form form={customerForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="客户姓名"
            rules={[
              { required: true, message: "请输入客户姓名" },
              { min: 1, message: "姓名至少1个字符" },
            ]}
          >
            <Input placeholder="请输入客户姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: "请输入手机号" },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: "请输入正确的手机号格式",
              },
            ]}
          >
            <Input placeholder="17888888888" maxLength={11} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 快速新建宠物弹窗 */}
      <Modal
        title="快速新建宠物"
        open={petModalVisible}
        onOk={handleCreatePet}
        onCancel={() => {
          setPetModalVisible(false);
          petForm.resetFields();
        }}
        confirmLoading={createPetMutation.isLoading}
        width={500}
      >
        <Form form={petForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label="宠物名称"
            rules={[
              { required: true, message: "请输入宠物名称" },
              { min: 1, message: "名称至少1个字符" },
            ]}
          >
            <Input placeholder="请输入宠物名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="petType"
                label="宠物类型"
                rules={[{ required: true, message: "请选择宠物类型" }]}
              >
                <Select placeholder="请选择类型">
                  <Option value={PetType.DOG}>狗</Option>
                  <Option value={PetType.CAT}>猫</Option>
                  <Option value={PetType.OTHER}>其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="性别"
                initialValue={PetGender.UNKNOWN}
              >
                <Select placeholder="请选择性别">
                  <Option value={PetGender.MALE}>公</Option>
                  <Option value={PetGender.FEMALE}>母</Option>
                  <Option value={PetGender.UNKNOWN}>未知</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="breed"
            label="品种"
            rules={[
              { required: true, message: "请输入品种" },
              { min: 1, message: "品种至少1个字符" },
            ]}
          >
            <Input placeholder="请输入品种，如：金毛、英短" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="age"
                label="年龄"
                rules={[
                  { required: true, message: "请输入年龄" },
                  { type: "number", min: 0, message: "年龄不能小于0" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  precision={0}
                  placeholder="请输入年龄"
                  suffix="岁"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isNeutered"
                label="是否绝育"
                initialValue={false}
              >
                <Select>
                  <Option value={true}>是</Option>
                  <Option value={false}>否</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 拒绝预约弹窗 */}
      <Modal
        title="拒绝预约"
        open={rejectModalVisible}
        onOk={handleSubmitReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectingAppointment(null);
          setRejectReason("");
        }}
        okText="确认拒绝"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        confirmLoading={reviewMutation.isLoading}
        width={500}
      >
        {rejectingAppointment ? (
          <p style={{ marginTop: 16 }}>
            拒绝「{rejectingAppointment.pet.name}」的预约，请填写拒绝理由（必填）：
          </p>
        ) : null}
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="如：预约时段已满，请改约其他时间"
          rows={3}
          maxLength={200}
        />
      </Modal>
    </div>
  );
}
