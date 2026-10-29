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
  Avatar,
  Select,
  Upload,
  Divider,
} from "antd";
import type { TableColumnsType, UploadProps } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  AppstoreOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  PetshopService,
  PetshopServiceBodyData,
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
import {
  createServiceCategory,
  deleteServiceCategory,
  fetchServiceCategories,
  updateServiceCategory,
  SERVICECATEGORY_KEY,
} from "@/services/queries/ServiceCategories";

// 从 axios 错误里取出后端返回的中文提示
function readApiError(error: unknown, fallback: string): string {
  const data = (error as any)?.response?.data;
  if (Array.isArray(data?.message)) return data.message[0] ?? fallback;
  if (typeof data?.message === "string" && data.message) return data.message;
  return fallback;
}
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadImage } from "@/services/queries/Upload";
import { assetUrl } from "@/utils/assetUrl";

const { Search } = Input;
const { TextArea } = Input;
const { Option } = Select;

export default function Services() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingService, setEditingService] = useState<PetshopService | null>(
    null,
  );
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  // 分类管理弹窗
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(
    null,
  );
  const [categoryForm] = Form.useForm();

  // 查询服务列表
  const { data: servicesData, isLoading } = useQuery({
    queryKey: [PETSHOPSERVICE_KEY],
    queryFn: fetchPetshopServices,
  });

  // 查询分类列表
  const { data: categoriesData } = useQuery({
    queryKey: [SERVICECATEGORY_KEY],
    queryFn: fetchServiceCategories,
  });
  const categories = categoriesData?.categories ?? [];

  // 创建服务
  const createServiceMutation = useMutation({
    mutationFn: (data: PetshopServiceBodyData) => createPetshopService(data),
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
      data: PetshopServiceBodyData;
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

  // ---------- 分类管理 ----------
  const createCategoryMutation = useMutation({
    mutationFn: (payload: { name: string; icon?: string | null }) =>
      createServiceCategory(payload),
    onSuccess: () => {
      message.success("分类创建成功");
      queryClient.invalidateQueries({ queryKey: [SERVICECATEGORY_KEY] });
      handleCloseCategoryModal();
    },
    onError: (error) =>
      message.error(readApiError(error, "分类创建失败，请重试")),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      name,
      icon,
    }: {
      id: string;
      name: string;
      icon?: string | null;
    }) => updateServiceCategory(id, { name, icon }),
    onSuccess: () => {
      message.success("分类更新成功");
      queryClient.invalidateQueries({ queryKey: [SERVICECATEGORY_KEY] });
      handleCloseCategoryModal();
    },
    onError: (error) =>
      message.error(readApiError(error, "分类更新失败，请重试")),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteServiceCategory(id),
    onSuccess: () => {
      message.success("分类已删除");
      queryClient.invalidateQueries({ queryKey: [SERVICECATEGORY_KEY] });
    },
    onError: (error) => message.error(readApiError(error, "删除分类失败")),
  });

  const handleOpenCategoryModal = (category?: ServiceCategory) => {
    setEditingCategory(category ?? null);
    categoryForm.resetFields();
    if (category) {
      categoryForm.setFieldsValue({ name: category.name, icon: category.icon });
    }
    setCategoryModalVisible(true);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalVisible(false);
    setEditingCategory(null);
    categoryForm.resetFields();
  };

  const handleSubmitCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          name: values.name,
          icon: values.icon || null,
        });
      } else {
        await createCategoryMutation.mutateAsync({
          name: values.name,
          icon: values.icon || null,
        });
      }
    } catch (error) {
      // 表单校验失败时不提示
    }
  };

  const handleDeleteCategory = (category: ServiceCategory) => {
    Modal.confirm({
      title: "确认删除分类",
      content: `确定要删除分类「${category.name}」吗？该分类下还有项目时无法删除。`,
      okText: "确认",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => deleteCategoryMutation.mutate(category.id),
    });
  };

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
      if (categoryFilter !== "ALL" && service.categoryId !== categoryFilter) {
        return false;
      }
      return true;
    }) || [];

  // 分类配色循环使用
  const CATEGORY_COLORS = ["blue", "red", "green", "purple", "orange", "cyan"];
  const CATEGORY_HEX = [
    "#1890ff",
    "#ff4d4f",
    "#52c41a",
    "#722ed1",
    "#fa8c16",
    "#13c2c2",
  ];
  const categoryIndex = (id?: string | null) =>
    Math.max(
      categories.findIndex((c) => c.id === id),
      0,
    );
  const categoryColor = (id?: string | null) =>
    CATEGORY_COLORS[categoryIndex(id) % CATEGORY_COLORS.length];
  const categoryHex = (id?: string | null) =>
    CATEGORY_HEX[categoryIndex(id) % CATEGORY_HEX.length];

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
      categoryId: service.categoryId ?? undefined,
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

      const serviceData: PetshopServiceBodyData = {
        title: values.title,
        description: values.description || "",
        categoryId: values.categoryId,
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
          title: service.title,
          description: service.description,
          categoryId: service.categoryId ?? "",
          value: service.value,
          duration: service.duration ?? 3600,
          status: newStatus,
          imageUrl: service.imageUrl,
        },
      });
      message.success(
        newStatus === ServiceStatus.ACTIVE ? "服务已启用" : "服务已停用",
      );
    } catch (error) {
      message.error("状态切换失败");
    }
  };

  // 表格列定义
  const columns: TableColumnsType<PetshopService> = [
    {
      title: "服务信息",
      key: "service",
      width: 280,
      render: (_, record) => {
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              size={48}
              src={record.imageUrl ? assetUrl(record.imageUrl) : undefined}
              icon={<AppstoreOutlined />}
              style={{
                backgroundColor: categoryHex(record.categoryId),
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
        if (!record.category) {
          return <Tag style={{ fontSize: 13 }}>未分类</Tag>;
        }
        return (
          <Tag color={categoryColor(record.categoryId)} style={{ fontSize: 13 }}>
            {record.category.icon ? `${record.category.icon} ` : ""}
            {record.category.name}
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
            <Space>
              <Button
                icon={<TagsOutlined />}
                onClick={() => handleOpenCategoryModal()}
              >
                新建服务
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                添加项目
              </Button>
            </Space>
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
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.icon ? `${category.icon} ` : ""}
                {category.name}
              </Option>
            ))}
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
        title={modalMode === "create" ? "添加项目" : "编辑项目"}
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
            name="categoryId"
            label="所属服务"
            rules={[{ required: true, message: "请选择所属服务" }]}
            extra="没有合适的分类？点表格右上角「新建服务」添加"
          >
            <Select placeholder="请选择所属服务">
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ` : ""}
                  {category.name}
                </Option>
              ))}
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

      {/* 分类管理弹窗（新建服务） */}
      <Modal
        title="服务分类"
        open={categoryModalVisible}
        onCancel={handleCloseCategoryModal}
        footer={null}
        width={560}
      >
        <div style={{ marginBottom: 8, color: "#8c8c8c", fontSize: 13 }}>
          分类是「洗护 / 美容 / 医疗」这样的大类，先建分类，再往里添加具体项目。
        </div>

        {categories.map((category) => {
          const count =
            servicesData?.services?.filter((s) => s.categoryId === category.id)
              .length ?? 0;
          return (
            <div
              key={category.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                marginBottom: 8,
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                background: editingCategory?.id === category.id ? "#f0f5ff" : "#fff",
              }}
            >
              <Space>
                <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>
                  {category.icon || "🐾"}
                </span>
                <span style={{ fontWeight: 500 }}>{category.name}</span>
                <span style={{ color: "#999", fontSize: 12 }}>
                  {count} 个项目
                </span>
              </Space>
              <Space size="small">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingCategory(category);
                    categoryForm.setFieldsValue({
                      name: category.name,
                      icon: category.icon,
                    });
                  }}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteCategory(category)}
                >
                  删除
                </Button>
              </Space>
            </div>
          );
        })}

        <Divider style={{ margin: "16px 0 12px" }} />

        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="name"
            label={editingCategory ? `编辑「${editingCategory.name}」` : "新建服务"}
            rules={[
              { required: true, message: "请输入分类名称" },
              { max: 20, message: "最多 20 个字符" },
            ]}
          >
            <Input placeholder="如：美容、训练、上门服务" />
          </Form.Item>
          <Form.Item name="icon" label="图标（可选，填一个 emoji）">
            <Input placeholder="如：✨" maxLength={4} />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              onClick={handleSubmitCategory}
              loading={
                createCategoryMutation.isLoading ||
                updateCategoryMutation.isLoading
              }
            >
              {editingCategory ? "保存修改" : "创建"}
            </Button>
            {editingCategory ? (
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  categoryForm.resetFields();
                }}
              >
                取消编辑
              </Button>
            ) : null}
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
