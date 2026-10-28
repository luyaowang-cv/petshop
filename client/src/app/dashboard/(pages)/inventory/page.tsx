"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Button, Input, Select, Space, Tag, Card } from "antd";
import type { TableProps } from "antd";
import {
  SearchOutlined,
  WarningOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useProducts } from "@/services/queries/Product";
import { ProductCategory, type Product } from "@/@types/Product";
import { centsToYuan } from "@/services/api/product";
import StockInModal from "@/components/inventory/StockInModal";

const { Search } = Input;
const { Option } = Select;

// 分类映射
const categoryMap = {
  [ProductCategory.FOOD]: "食品",
  [ProductCategory.SUPPLIES]: "用品",
  [ProductCategory.MEDICINE]: "药品",
  [ProductCategory.TOY]: "玩具",
  [ProductCategory.PET]: "宠物",
  [ProductCategory.OTHER]: "其他",
};

export default function InventoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProductCategory | undefined>();
  const [sortField, setSortField] = useState("stock");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [stockInModalVisible, setStockInModalVisible] = useState(false);

  // 查询商品列表
  const { data, isLoading, refetch } = useProducts({
    page,
    pageSize,
    search,
    category,
    sortField,
    sortOrder,
  });

  // 表格列定义
  const columns: TableProps<Product>["columns"] = [
    {
      title: "商品名称",
      dataIndex: "name",
      key: "name",
      width: 150,
      ellipsis: true,
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      width: 80,
      render: (category: ProductCategory) => categoryMap[category],
    },
    {
      title: "当前库存",
      dataIndex: "stock",
      key: "stock",
      width: 120,
      sorter: true,
      render: (stock: number, record: Product) => (
        <span>
          {stock} {record.unit}
        </span>
      ),
    },
    {
      title: "库存预警",
      key: "stockAlert",
      width: 100,
      render: (_, record: Product) => {
        if (record.stock === 0) {
          return (
            <Tag icon={<WarningOutlined />} color="error">
              缺货
            </Tag>
          );
        }
        if (record.isLowStock) {
          return (
            <Tag icon={<WarningOutlined />} color="warning">
              预警
            </Tag>
          );
        }
        return <Tag color="success">正常</Tag>;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record: Product) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/dashboard/inventory/${record.id}`)}
        >
          详情
        </Button>
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

  // 打开入库弹窗
  const handleOpenStockInModal = () => {
    setStockInModalVisible(true);
  };

  // 入库成功回调
  const handleStockInSuccess = () => {
    refetch(); // 刷新商品列表
  };

  return (
    <div style={{ padding: "24px", height: "100vh", overflow: "auto" }}>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "20px", fontWeight: 600 }}>库存管理</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenStockInModal}
            >
              商品入库
            </Button>
          </div>
        }
        bordered={false}
      >
        {/* 搜索栏和筛选 */}
        <Space
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
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
              <Option value={ProductCategory.FOOD}>食品</Option>
              <Option value={ProductCategory.SUPPLIES}>用品</Option>
              <Option value={ProductCategory.MEDICINE}>药品</Option>
              <Option value={ProductCategory.TOY}>玩具</Option>
              <Option value={ProductCategory.PET}>宠物</Option>
              <Option value={ProductCategory.OTHER}>其他</Option>
            </Select>
          </Space>
        </Space>

        {/* 库存表格 */}
        <Table
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
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 入库弹窗 */}
      <StockInModal
        visible={stockInModalVisible}
        onCancel={() => setStockInModalVisible(false)}
        onSuccess={handleStockInSuccess}
      />
    </div>
  );
}
