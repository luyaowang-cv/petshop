"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  Popconfirm,
  Card,
  message,
} from "antd";
import type { TableProps } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useProducts, useProductMutations } from "@/services/queries/Product";
import { ProductCategory, ProductStatus, type Product } from "@/@types/Product";
import { PRODUCT, COMMON } from "@/constants/i18n";
import { yuanToCents, centsToYuan } from "@/services/api/product";

const { Search } = Input;
const { Option } = Select;

// 分类映射
const categoryMap = {
  [ProductCategory.FOOD]: PRODUCT.CATEGORY_FOOD,
  [ProductCategory.SUPPLIES]: PRODUCT.CATEGORY_SUPPLIES,
  [ProductCategory.MEDICINE]: PRODUCT.CATEGORY_MEDICINE,
  [ProductCategory.TOY]: PRODUCT.CATEGORY_TOY,
  [ProductCategory.PET]: PRODUCT.CATEGORY_PET,
  [ProductCategory.OTHER]: PRODUCT.CATEGORY_OTHER,
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | undefined>();
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form] = Form.useForm();

  // 从 URL 参数读取分类筛选
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (
      categoryParam &&
      Object.values(ProductCategory).includes(categoryParam as ProductCategory)
    ) {
      setCategory(categoryParam as ProductCategory);
    }
  }, [searchParams]);

  // 查询商品列表
  const { data, isLoading } = useProducts({
    page,
    pageSize,
    search,
    category,
    sortField,
    sortOrder,
  });

  // 商品变更操作
  const {
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    batchDeleteProducts,
    batchActivateProducts,
    batchDeactivateProducts,
  } = useProductMutations();

  // 表格列定义
  const columns: TableProps<Product>["columns"] = [
    {
      title: PRODUCT.NAME,
      dataIndex: "name",
      key: "name",
      width: 150,
      sorter: true,
      ellipsis: true,
    },
    {
      title: PRODUCT.CATEGORY,
      dataIndex: "category",
      key: "category",
      width: 80,
      render: (category: ProductCategory) => categoryMap[category],
    },
    {
      title: PRODUCT.PRICE,
      dataIndex: "price",
      key: "price",
      width: 90,
      sorter: true,
      render: (price: number) => `¥${centsToYuan(price).toFixed(2)}`,
    },
    {
      title: PRODUCT.COST,
      dataIndex: "cost",
      key: "cost",
      width: 90,
      sorter: true,
      render: (cost: number) => `¥${centsToYuan(cost).toFixed(2)}`,
    },
    {
      title: PRODUCT.STOCK,
      dataIndex: "stock",
      key: "stock",
      width: 100,
      sorter: true,
      render: (stock: number, record: Product) => (
        <Tag color={record.isLowStock ? "red" : "green"}>
          {stock} {record.unit}
        </Tag>
      ),
    },
    {
      title: PRODUCT.STATUS,
      key: "status",
      width: 90,
      render: (_, record: Product) => {
        if (record.isLowStock) {
          return <Tag color="orange">{PRODUCT.LOW_STOCK}</Tag>;
        }
        return (
          <Tag
            color={record.status === ProductStatus.ACTIVE ? "blue" : "default"}
          >
            {record.status === ProductStatus.ACTIVE
              ? PRODUCT.STATUS_ACTIVE
              : PRODUCT.STATUS_INACTIVE}
          </Tag>
        );
      },
    },
    {
      title: "操作",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record: Product) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: "0 4px" }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={
              record.status === ProductStatus.ACTIVE ? (
                <StopOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            onClick={() => handleToggleStatus(record.id)}
            loading={toggleProductStatus.isPending}
            style={{ padding: "0 4px" }}
          >
            {record.status === ProductStatus.ACTIVE ? "下架" : "上架"}
          </Button>
          <Popconfirm
            title={COMMON.CONFIRM_DELETE}
            description="删除商品前请确认该商品无任何销售记录和入库记录"
            onConfirm={() => handleDelete(record.id)}
            okText={COMMON.CONFIRM}
            cancelText={COMMON.CANCEL}
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              style={{ padding: "0 4px" }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理表格变化（分页、排序）
  const handleTableChange: TableProps<Product>["onChange"] = (
    pagination,
    filters,
    sorter: any,
  ) => {
    if (pagination.current) setPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);

    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === "ascend" ? "asc" : "desc");
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // 处理分类筛选
  const handleCategoryChange = (value: ProductCategory | undefined) => {
    setCategory(value);
    setPage(1);
  };

  // 打开编辑弹窗
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      price: centsToYuan(product.price),
      cost: centsToYuan(product.cost),
    });
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = (id: string) => {
    deleteProduct.mutate(id);
  };

  // 处理切换状态
  const handleToggleStatus = (id: string) => {
    toggleProductStatus.mutate(id);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请先选择要删除的商品");
      return;
    }
    Modal.confirm({
      title: "确认批量删除",
      content: `确定要删除选中的 ${selectedRowKeys.length} 个商品吗？删除后无法恢复。`,
      okText: COMMON.CONFIRM,
      cancelText: COMMON.CANCEL,
      okButtonProps: { danger: true },
      onOk: () => {
        batchDeleteProducts.mutate(selectedRowKeys as string[], {
          onSuccess: () => {
            setSelectedRowKeys([]);
          },
        });
      },
    });
  };

  // 处理批量上架
  const handleBatchActivate = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请先选择要上架的商品");
      return;
    }
    batchActivateProducts.mutate(selectedRowKeys as string[], {
      onSuccess: () => {
        setSelectedRowKeys([]);
      },
    });
  };

  // 处理批量下架
  const handleBatchDeactivate = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请先选择要下架的商品");
      return;
    }
    batchDeactivateProducts.mutate(selectedRowKeys as string[], {
      onSuccess: () => {
        setSelectedRowKeys([]);
      },
    });
  };

  // 清空选择
  const handleClearSelection = () => {
    setSelectedRowKeys([]);
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        ...values,
        price: yuanToCents(values.price),
        cost: yuanToCents(values.cost),
      };

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data });
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  return (
    <div style={{ padding: "16px", height: "100vh", overflow: "auto" }}>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {category && (
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push("/dashboard/products/categories")}
                  type="text"
                  style={{ padding: "4px 8px" }}
                >
                  返回分类
                </Button>
              )}
              <span style={{ fontSize: "18px", fontWeight: 600 }}>
                {category
                  ? `${categoryMap[category]} - 商品列表`
                  : PRODUCT.TITLE}
              </span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/dashboard/inventory")}
            >
              去入库
            </Button>
          </div>
        }
        bordered={false}
        bodyStyle={{ padding: "16px" }}
      >
        {/* 搜索栏和批量操作 */}
        <Space
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          {/* 左侧：搜索和筛选 */}
          <Space size="middle">
            <Search
              placeholder="搜索商品名称..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="选择分类"
              allowClear
              style={{ width: 130 }}
              onChange={handleCategoryChange}
              value={category}
            >
              <Option value={ProductCategory.FOOD}>
                {PRODUCT.CATEGORY_FOOD}
              </Option>
              <Option value={ProductCategory.SUPPLIES}>
                {PRODUCT.CATEGORY_SUPPLIES}
              </Option>
              <Option value={ProductCategory.MEDICINE}>
                {PRODUCT.CATEGORY_MEDICINE}
              </Option>
              <Option value={ProductCategory.TOY}>
                {PRODUCT.CATEGORY_TOY}
              </Option>
              <Option value={ProductCategory.PET}>
                {PRODUCT.CATEGORY_PET}
              </Option>
              <Option value={ProductCategory.OTHER}>
                {PRODUCT.CATEGORY_OTHER}
              </Option>
            </Select>
          </Space>

          {/* 右侧：批量操作按钮 */}
          {selectedRowKeys.length > 0 && (
            <Space size="small">
              <span style={{ color: "#666", fontSize: 14 }}>
                {PRODUCT.SELECTED_COUNT}: {selectedRowKeys.length} 项
              </span>
              <Button
                size="small"
                onClick={handleClearSelection}
                style={{ padding: "0 8px" }}
              >
                {PRODUCT.CLEAR_SELECTION}
              </Button>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={handleBatchActivate}
                loading={batchActivateProducts.isPending}
              >
                {PRODUCT.BATCH_ACTIVATE}
              </Button>
              <Button
                size="small"
                icon={<StopOutlined />}
                onClick={handleBatchDeactivate}
                loading={batchDeactivateProducts.isPending}
              >
                {PRODUCT.BATCH_DEACTIVATE}
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
                loading={batchDeleteProducts.isPending}
              >
                {PRODUCT.BATCH_DELETE}
              </Button>
            </Space>
          )}
        </Space>

        {/* 商品表格 */}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            size: "default",
          }}
          onChange={handleTableChange}
          size="middle"
        />
      </Card>

      {/* 商品编辑表单弹窗 */}
      <Modal
        title={PRODUCT.EDIT}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={updateProduct.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="name"
            label={PRODUCT.NAME}
            rules={[{ required: true, message: PRODUCT.ENTER_NAME }]}
          >
            <Input placeholder={PRODUCT.ENTER_NAME} />
          </Form.Item>

          <Form.Item
            name="category"
            label={PRODUCT.CATEGORY}
            rules={[{ required: true, message: PRODUCT.ENTER_CATEGORY }]}
          >
            <Select placeholder={PRODUCT.ENTER_CATEGORY}>
              <Option value={ProductCategory.FOOD}>
                {PRODUCT.CATEGORY_FOOD}
              </Option>
              <Option value={ProductCategory.SUPPLIES}>
                {PRODUCT.CATEGORY_SUPPLIES}
              </Option>
              <Option value={ProductCategory.MEDICINE}>
                {PRODUCT.CATEGORY_MEDICINE}
              </Option>
              <Option value={ProductCategory.TOY}>
                {PRODUCT.CATEGORY_TOY}
              </Option>
              <Option value={ProductCategory.PET}>
                {PRODUCT.CATEGORY_PET}
              </Option>
              <Option value={ProductCategory.OTHER}>
                {PRODUCT.CATEGORY_OTHER}
              </Option>
            </Select>
          </Form.Item>

          <Space style={{ width: "100%" }} size="large">
            <Form.Item
              name="price"
              label={`${PRODUCT.PRICE}（元）`}
              rules={[
                { required: true, message: PRODUCT.ENTER_PRICE },
                { type: "number", min: 0, message: "售价不能为负数" },
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                placeholder={PRODUCT.ENTER_PRICE}
                style={{ width: "100%" }}
                min={0}
                precision={2}
              />
            </Form.Item>

            <Form.Item
              name="cost"
              label={`${PRODUCT.COST}（元）`}
              rules={[
                { required: true, message: PRODUCT.ENTER_COST },
                { type: "number", min: 0, message: "成本不能为负数" },
              ]}
              style={{ flex: 1 }}
            >
              <InputNumber
                placeholder={PRODUCT.ENTER_COST}
                style={{ width: "100%" }}
                min={0}
                precision={2}
              />
            </Form.Item>
          </Space>

          <Form.Item
            name="minStock"
            label={PRODUCT.MIN_STOCK}
            rules={[
              { required: true, message: PRODUCT.ENTER_MIN_STOCK },
              { type: "number", min: 0, message: "最低库存不能为负数" },
            ]}
          >
            <InputNumber
              placeholder={PRODUCT.ENTER_MIN_STOCK}
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="unit"
            label={PRODUCT.UNIT}
            rules={[{ required: true, message: PRODUCT.ENTER_UNIT }]}
          >
            <Select placeholder={PRODUCT.ENTER_UNIT}>
              <Option value="个">{PRODUCT.UNIT_PIECE}</Option>
              <Option value="袋">{PRODUCT.UNIT_BAG}</Option>
              <Option value="瓶">{PRODUCT.UNIT_BOTTLE}</Option>
              <Option value="盒">{PRODUCT.UNIT_BOX}</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label={PRODUCT.DESCRIPTION}>
            <Input.TextArea
              placeholder="请输入商品描述"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item name="imageUrl" label={PRODUCT.IMAGE}>
            <Input placeholder="请输入商品图片URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
