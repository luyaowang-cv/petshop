"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  Descriptions,
  Table,
  Tabs,
  Button,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
} from "antd";
import type { TableProps } from "antd";
import {
  ArrowLeftOutlined,
  WarningOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useProducts } from "@/services/queries/Product";
import { useStockRecords } from "@/services/queries/StockRecord";
import { ProductCategory } from "@/@types/Product";
import { StockInType, type StockRecord } from "@/@types/StockRecord";
import { centsToYuan } from "@/services/api/product";
import dayjs from "dayjs";

// 分类映射
const categoryMap = {
  [ProductCategory.FOOD]: "食品",
  [ProductCategory.SUPPLIES]: "用品",
  [ProductCategory.MEDICINE]: "药品",
  [ProductCategory.TOY]: "玩具",
  [ProductCategory.PET]: "宠物",
  [ProductCategory.OTHER]: "其他",
};

// 入库类型映射
const stockInTypeMap = {
  [StockInType.PURCHASE]: "采购入库",
  [StockInType.ADJUSTMENT]: "库存调整",
};

export default function InventoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 查询商品详情
  const { data: productsData } = useProducts({
    page: 1,
    pageSize: 100,
  });

  const product = productsData?.data.find((p) => p.id === productId);

  // 查询入库记录
  const { data: stockRecordsData, isLoading } = useStockRecords({
    page,
    pageSize,
    productId,
  });

  // 计算最近入库时间
  const lastStockInTime =
    stockRecordsData?.data && stockRecordsData.data.length > 0
      ? dayjs(stockRecordsData.data[0].createdAt).format("YYYY-MM-DD HH:mm:ss")
      : "暂无入库记录";

  // 入库记录表格列定义
  const columns: TableProps<StockRecord>["columns"] = [
    {
      title: "入库时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "入库类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type: StockInType) => (
        <Tag color={type === StockInType.PURCHASE ? "blue" : "orange"}>
          {stockInTypeMap[type]}
        </Tag>
      ),
    },
    {
      title: "入库数量",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity: number) => (
        <span style={{ color: "#52c41a", fontWeight: 600 }}>
          +{quantity} {product?.unit}
        </span>
      ),
    },
    {
      title: "成本单价",
      dataIndex: "cost",
      key: "cost",
      width: 100,
      render: (cost: number) =>
        cost > 0 ? `¥${centsToYuan(cost).toFixed(2)}` : "-",
    },
    {
      title: "总成本",
      dataIndex: "totalCost",
      key: "totalCost",
      width: 120,
      render: (totalCost: number) =>
        totalCost > 0 ? (
          <Tag color="blue">¥{centsToYuan(totalCost).toFixed(2)}</Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "供应商",
      dataIndex: "supplier",
      key: "supplier",
      width: 120,
      render: (supplier: string | null) => supplier || "-",
    },
    {
      title: "操作员",
      dataIndex: "operator",
      key: "operator",
      width: 100,
    },
    {
      title: "备注",
      dataIndex: "note",
      key: "note",
      width: 150,
      ellipsis: true,
      render: (note: string | null) => note || "-",
    },
  ];

  // 处理表格变化（分页）
  const handleTableChange: TableProps<StockRecord>["onChange"] = (
    pagination,
  ) => {
    if (pagination.current) setPage(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);
  };

  if (!product) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <p>商品不存在</p>
          <Button onClick={() => router.push("/dashboard/inventory")}>
            返回库存列表
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", height: "100vh", overflow: "auto" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/dashboard/inventory")}
              type="text"
              style={{ padding: "4px 8px" }}
            >
              返回
            </Button>
            <span style={{ fontSize: "20px", fontWeight: 600 }}>库存详情</span>
          </div>
        }
        bordered={false}
      >
        <Tabs
          defaultActiveKey="info"
          items={[
            {
              key: "info",
              label: "基本信息",
              children: (
                <div>
                  {/* 统计卡片 */}
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="当前库存"
                          value={product.stock}
                          suffix={product.unit}
                          prefix={<InboxOutlined />}
                          valueStyle={{
                            color: product.isLowStock ? "#ff4d4f" : "#52c41a",
                          }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="库存预警值"
                          value={product.minStock}
                          suffix={product.unit}
                          prefix={<WarningOutlined />}
                          valueStyle={{ color: "#faad14" }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="库存价值"
                          value={centsToYuan(product.stock * product.cost)}
                          precision={2}
                          prefix="¥"
                          valueStyle={{ color: "#1890ff" }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* 商品详情 */}
                  <Descriptions
                    title="商品信息"
                    bordered
                    column={2}
                    size="middle"
                  >
                    <Descriptions.Item label="商品名称">
                      {product.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="商品分类">
                      {categoryMap[product.category]}
                    </Descriptions.Item>
                    <Descriptions.Item label="当前库存">
                      <Space>
                        {product.isLowStock && (
                          <WarningOutlined style={{ color: "#ff4d4f" }} />
                        )}
                        <span>
                          {product.stock} {product.unit}
                        </span>
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="库存预警">
                      {product.minStock} {product.unit}
                    </Descriptions.Item>
                    <Descriptions.Item label="成本单价">
                      ¥{centsToYuan(product.cost).toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label="售价">
                      ¥{centsToYuan(product.price).toFixed(2)}
                    </Descriptions.Item>
                    <Descriptions.Item label="库存状态">
                      {product.stock === 0 ? (
                        <Tag color="default">缺货</Tag>
                      ) : product.isLowStock ? (
                        <Tag color="red">库存不足</Tag>
                      ) : (
                        <Tag color="green">正常</Tag>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="最近入库时间">
                      {lastStockInTime}
                    </Descriptions.Item>
                    <Descriptions.Item label="商品描述" span={2}>
                      {product.description || "-"}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            },
            {
              key: "records",
              label: "入库记录",
              children: (
                <Table
                  columns={columns}
                  dataSource={stockRecordsData?.data || []}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: stockRecordsData?.total || 0,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                    size: "default",
                  }}
                  onChange={handleTableChange}
                  size="middle"
                  scroll={{ x: 1000 }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
