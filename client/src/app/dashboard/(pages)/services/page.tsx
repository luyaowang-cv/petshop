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
  Form,
  InputNumber,
  Row,
  Col,
  Statistic,
  Avatar,
  Select,
  Upload,
} from "antd";
import type { TableColumnsType, UploadProps } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ScissorOutlined,
  AppstoreOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  PetshopService,
  ServiceCategory,
  ServiceStatus,
} from "@/@types/PetshopServices";
import {
  deletePetshopService,
  fetchPetshopServices,
  createPetshopService,
  updatePetshopService,
  PETSHOPSERVICE_KEY,
} from "@/services/queries/PetshopServices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadImage } from "@/services/queries/Upload";
import { assetUrl } from "@/utils/assetUrl";

const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

export default function Services() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | "ALL">(
    "ALL",
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingService, setEditingService] = useState<PetshopService | null>(
    null,
  );
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  // 查询服务列表
  const { data: servicesData, isLoading } = useQuery({
    queryKey: [PETSHOPSERVICE_KEY],
    queryFn: fetchPetshopServices,
  });

  // 创建服务
  const createServiceMutation = useMutation({
    mutationFn: (
      data: Omit<PetshopService, "id" | "createdAt" | "updatedAt">,
    ) => createPetshopService(data),
    onSuccess: () => {
      message.success("服务创建成功");
      queryClient.invalidateQueries({ queryKey: [PETSHOPSERVICE_KEY] });
      handleCloseModal();
    },
    onError: () => {
      message.error("服务创建失败，请重试");
    },
  });

  // 更新服务
  const updateServiceMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<PetshopService, "id" | "createdAt" | "updatedAt">;
    }) => updatePetshopService(id, data),
    onSuccess: () => {
      message.success("服务更新成功");
      queryClient.invalidateQueries({ queryKey: [PETSHOPSERVICE_KEY] });
      handleCloseModal();
    },
    onError: () => {
      message.error("服务更新失败，请重试");
    },
  });

  // 删除服务
  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => deletePetshopService(id),
    onSuccess: () => {
      message.success("服务删除成功");
      queryClient.invalidateQueries({ queryKey: [PETSHOPSERVICE_KEY] });
    },
    onError: () => {
      message.error("删除服务失败，请重试");
    },
  });

  // 过滤服务数据
  const filteredServices =
    servicesData?.services?.filter((service) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchSearch =
          service.title.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower);
        if (!matchSearch) return false;
      }
      if (categoryFilter !== "ALL" && service.category !== categoryFilter) {
        return false;
      }
      return true;
    }) || [];

  // 统计数据
  const totalServices = servicesData?.services?.length || 0;
  const activeServices =
    servicesData?.services?.filter((s) => s.status === ServiceStatus.ACTIVE)
      .length || 0;
  const groomingCount =
    servicesData?.services?.filter(
      (s) => s.category === ServiceCategory.GROOMING,
    ).length || 0;
  const medicalCount =
    servicesData?.services?.filter(
      (s) => s.category === ServiceCategory.MEDICAL,
    ).length || 0;
  const boardingCount =
    servicesData?.services?.filter(
      (s) => s.category === ServiceCategory.BOARDING,
    ).length || 0;

  // 上传服务封面
  const handleUpload: UploadProps["customRequest"] = async ({
    file,
    onSuccess,
    onError,
  }) => {
    try {
      setUploading(true);
      const url = await uploadImage(file as File);
      setImageUrl(url);
      onSuccess?.(url);
    } catch (e) {
      onError?.(e as Error);
    } finally {
      setUploading(false);
    }
  };

  // 打开创建弹窗
  const handleCreate = () => {
    setModalMode("create");
    setEditingService(null);
    form.resetFields();
    form.setFieldsValue({ status: ServiceStatus.ACTIVE });
    setImageUrl("");
    setModalVisible(true);
  };

  // 打开编辑弹窗
  const handleEdit = (service: PetshopService) => {
    setModalMode("edit");
    setEditingService(service);
    form.setFieldsValue({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.value / 100, // 转换为元
      status: service.status,
    });
    setImageUrl(service.imageUrl || "");
    setModalVisible(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingService(null);
    setImageUrl("");
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const serviceData: Omit<
        PetshopService,
        "id" | "createdAt" | "updatedAt"
      > = {
        title: values.title,
        description: values.description || "",
        category: values.category,
        value: Math.round(values.price * 100), // 转换为分
        duration: 3600, // 默认1小时（3600秒），保留字段以便后续扩展
        status: values.status,
        imageUrl: imageUrl || undefined,
      };

      if (modalMode === "create") {
        await createServiceMutation.mutateAsync(serviceData);
      } else if (editingService) {
        await updateServiceMutation.mutateAsync({
          id: editingService.id,
          data: serviceData,
        });
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  // 处理删除
  const handleDelete = (id: string, title: string) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除服务"${title}"吗？删除后无法恢复。`,
      okText: "确认",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => deleteServiceMutation.mutate(id),
    });
  };

  // 切换服务状态
  const handleToggleStatus = async (service: PetshopService) => {
    const newStatus =
      service.status === ServiceStatus.ACTIVE
        ? ServiceStatus.INACTIVE
        : ServiceStatus.ACTIVE;

    try {
      await updateServiceMutation.mutateAsync({
        id: service.id,
        data: {
          ...service,
          status: newStatus,
        },
      });
      message.success(
        newStatus === ServiceStatus.ACTIVE ? "服务已启用" : "服务已停用",
      );
    } catch (error) {
      message.error("状态切换失败");
    }
  };

  // 获取分类配置
  const getCategoryConfig = (category: ServiceCategory) => {
    const config = {
      [ServiceCategory.GROOMING]: {
        text: "洗护",
        color: "blue",
        icon: <ScissorOutlined />,
      },
      [ServiceCategory.MEDICAL]: {
        text: "医疗",
        color: "red",
        icon: <MedicineBoxOutlined />,
      },
      [ServiceCategory.BOARDING]: {
        text: "寄养",
        color: "green",
        icon: <HomeOutlined />,
      },
    };
    return config[category];
  };

  // 表格列定义
  const columns: TableColumnsType<PetshopService> = [
    {
      title: "服务信息",
      key: "service",
      width: 280,
      render: (_, record) => {
        const categoryConfig = getCategoryConfig(record.category);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              size={48}
              src={record.imageUrl ? assetUrl(record.imageUrl) : undefined}
              icon={categoryConfig.icon}
              style={{
                backgroundColor:
                  categoryConfig.color === "blue"
                    ? "#1890ff"
                    : categoryConfig.color === "red"
                      ? "#ff4d4f"
                      : "#52c41a",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 15,
                  marginBottom: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {record.title}
              </div>
              {record.description && (
                <div
                  style={{
                    color: "#8c8c8c",
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {record.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "分类",
      key: "category",
      width: 100,
      align: "center",
      render: (_, record) => {
        const config = getCategoryConfig(record.category);
        return (
          <Tag color={config.color} icon={config.icon} style={{ fontSize: 13 }}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "价格",
      key: "value",
      width: 110,
      align: "center",
      sorter: (a, b) => a.value - b.value,
      render: (_, record) => (
        <Tag
          color="green"
          style={{ fontSize: 14, padding: "4px 12px", fontWeight: 600 }}
        >
          ¥{(record.value / 100).toFixed(2)}
        </Tag>
      ),
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tag
          color={record.status === ServiceStatus.ACTIVE ? "success" : "default"}
          icon={
            record.status === ServiceStatus.ACTIVE ? (
              <CheckCircleOutlined />
            ) : (
              <StopOutlined />
            )
          }
        >
          {record.status === ServiceStatus.ACTIVE ? "启用" : "停用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 200,
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
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record)}
          >
            {record.status === ServiceStatus.ACTIVE ? "停用" : "启用"}
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.title)}
            loading={deleteServiceMutation.isLoading}
          >
            删除
          </Button>
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
              title="服务总数"
              value={totalServices}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="启用服务"
              value={activeServices}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="洗护"
              value={groomingCount}
              prefix={<ScissorOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="医疗"
              value={medicalCount}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="寄养"
              value={boardingCount}
              prefix={<HomeOutlined />}
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
              服务项目管理
            </span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              添加服务
            </Button>
          </div>
        }
        styles={{ body: { padding: "16px" } }}
      >
        {/* 搜索和筛选栏 */}
        <Space style={{ marginBottom: 12 }} size="middle">
          <Search
            placeholder="搜索服务名称或描述..."
            allowClear
            onSearch={setSearch}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
          >
            <Option value="ALL">全部分类</Option>
            <Option value={ServiceCategory.GROOMING}>
              <ScissorOutlined /> 洗护
            </Option>
            <Option value={ServiceCategory.MEDICAL}>
              <MedicineBoxOutlined /> 医疗
            </Option>
            <Option value={ServiceCategory.BOARDING}>
              <HomeOutlined /> 寄养
            </Option>
          </Select>
        </Space>

        {/* 服务表格 */}
        <Table
          columns={columns}
          dataSource={filteredServices}
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

      {/* 服务表单弹窗 */}
      <Modal
        title={modalMode === "create" ? "添加服务" : "编辑服务"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={
          createServiceMutation.isLoading || updateServiceMutation.isLoading
        }
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label="服务名称"
            rules={[
              { required: true, message: "请输入服务名称" },
              { min: 1, message: "名称至少1个字符" },
              { max: 100, message: "名称最多100个字符" },
            ]}
          >
            <Input placeholder="请输入服务名称，如：基础洗护套餐" />
          </Form.Item>

          <Form.Item
            name="category"
            label="服务分类"
            rules={[{ required: true, message: "请选择服务分类" }]}
          >
            <Select placeholder="请选择服务分类">
              <Option value={ServiceCategory.GROOMING}>
                <ScissorOutlined /> 洗护
              </Option>
              <Option value={ServiceCategory.MEDICAL}>
                <MedicineBoxOutlined /> 医疗
              </Option>
              <Option value={ServiceCategory.BOARDING}>
                <HomeOutlined /> 寄养
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="服务描述"
            rules={[{ max: 500, message: "描述最多500个字符" }]}
          >
            <TextArea
              rows={3}
              placeholder="请输入服务描述，如：包含洗澡、吹干、梳毛、剪指甲等基础护理"
            />
          </Form.Item>

          <Form.Item label="服务封面">
            <Upload
              listType="picture-card"
              showUploadList={false}
              customRequest={handleUpload}
              accept="image/jpeg,image/png,image/webp"
            >
              {imageUrl ? (
                <img
                  src={assetUrl(imageUrl)}
                  alt="服务封面"
                  style={{ width: "100%" }}
                />
              ) : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
            {uploading ? <div style={{ color: "#999" }}>上传中…</div> : null}
          </Form.Item>

          <Form.Item
            name="price"
            label="服务价格（元）"
            rules={[
              { required: true, message: "请输入服务价格" },
              { type: "number", min: 0.01, message: "价格必须大于0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              precision={2}
              min={0.01}
              placeholder="请输入价格"
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="服务状态"
            rules={[{ required: true, message: "请选择服务状态" }]}
          >
            <Select>
              <Option value={ServiceStatus.ACTIVE}>
                <CheckCircleOutlined /> 启用
              </Option>
              <Option value={ServiceStatus.INACTIVE}>
                <StopOutlined /> 停用
              </Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
