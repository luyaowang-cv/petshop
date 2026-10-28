"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Space,
  Table,
  Select,
  Button,
  Tag,
  Spin,
  Empty,
} from "antd";
import type { Dayjs } from "dayjs";
import {
  ShoppingCartOutlined,
  TrophyOutlined,
  WarningOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  fetchProductSalesStatistics,
  PRODUCT_SALES_KEY,
} from "@/services/queries/ProductOrder";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const { RangePicker } = DatePicker;

type RangeValue = [Dayjs | null, Dayjs | null] | null;
type TimeFilter = "today" | "week" | "month" | "custom";

const categoryOptions = [
  { label: "全部分类", value: "" },
  { label: "食品", value: "FOOD" },
  { label: "用品", value: "SUPPLIES" },
  { label: "药品", value: "MEDICINE" },
  { label: "玩具", value: "TOY" },
  { label: "宠物", value: "PET" },
  { label: "其他", value: "OTHER" },
];

const categoryMap: Record<string, string> = {
  FOOD: "食品",
  SUPPLIES: "用品",
  MEDICINE: "药品",
  TOY: "玩具",
  PET: "宠物",
  OTHER: "其他",
};

export default function ProductSalesPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [customDateRange, setCustomDateRange] = useState<RangeValue>(null);
  const [category, setCategory] = useState<string>("");

  // 根据时间筛选计算日期范围
  const getDateRange = (): { startDate: string; endDate: string } => {
    const now = dayjs();
    let startDate: Dayjs;
    let endDate: Dayjs = now;

    switch (timeFilter) {
      case "today":
        startDate = now.startOf("day");
        endDate = now.endOf("day");
        break;
      case "week":
        startDate = now.subtract(6, "days").startOf("day");
        break;
      case "month":
        startDate = now.startOf("month");
        break;
      case "custom":
        if (customDateRange && customDateRange[0] && customDateRange[1]) {
          startDate = customDateRange[0];
          endDate = customDateRange[1];
        } else {
          startDate = now.subtract(6, "days").startOf("day");
        }
        break;
      default:
        startDate = now.subtract(6, "days").startOf("day");
    }

    return {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
    };
  };

  const dateRange = getDateRange();

  // 获取销量统计数据
  const { data: statistics, isLoading } = useQuery({
    queryKey: [
      PRODUCT_SALES_KEY,
      dateRange.startDate,
      dateRange.endDate,
      category,
    ],
    queryFn: () =>
      fetchProductSalesStatistics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        category: category || undefined,
      }),
  });

  const formatCurrency = (value: number) => {
    return `¥${value.toFixed(2)}`;
  };

  // 条形图数据（TOP 6）
  const barChartData =
    statistics?.topProducts.slice(0, 6).map((item) => ({
      name: item.productName,
      销量: item.totalQuantity,
      销售额: item.totalRevenue,
    })) || [];

  // 表格列定义
  const columns = [
    {
      title: "排名",
      key: "rank",
      width: 80,
      render: (_: any, __: any, index: number) => {
        if (index === 0) {
          return (
            <span style={{ fontWeight: "bold", color: "#faad14" }}>
              <CrownOutlined style={{ marginRight: 4 }} />1
            </span>
          );
        }
        if (index < 3) {
          return (
            <span
              style={{
                fontWeight: "bold",
                color: index === 1 ? "#52c41a" : "#1890ff",
              }}
            >
              <TrophyOutlined style={{ marginRight: 4 }} />
              {index + 1}
            </span>
          );
        }
        return index + 1;
      },
    },
    {
      title: "商品名称",
      dataIndex: "productName",
      key: "productName",
    },
    {
      title: "分类",
      dataIndex: "category",
      key: "category",
      render: (category: string) => (
        <Tag color="blue">{categoryMap[category] || category}</Tag>
      ),
    },
    {
      title: "销量",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      sorter: (a: any, b: any) => a.totalQuantity - b.totalQuantity,
      render: (value: number) => (
        <span style={{ fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: "销售额",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      sorter: (a: any, b: any) => a.totalRevenue - b.totalRevenue,
      render: (value: number) => (
        <span style={{ color: "#52c41a", fontWeight: 500 }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "库存",
      dataIndex: "stock",
      key: "stock",
      sorter: (a: any, b: any) => a.stock - b.stock,
      render: (value: number) => {
        if (value <= 5) {
          return <Tag color="red">{value}</Tag>;
        }
        if (value <= 15) {
          return <Tag color="orange">{value}</Tag>;
        }
        return <Tag color="green">{value}</Tag>;
      },
    },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          padding: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* 时间与分类筛选 */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <Space>
            <span style={{ fontWeight: 500 }}>时间筛选：</span>
            <Button
              type={timeFilter === "today" ? "primary" : "default"}
              onClick={() => setTimeFilter("today")}
            >
              今天
            </Button>
            <Button
              type={timeFilter === "week" ? "primary" : "default"}
              onClick={() => setTimeFilter("week")}
            >
              本周
            </Button>
            <Button
              type={timeFilter === "month" ? "primary" : "default"}
              onClick={() => setTimeFilter("month")}
            >
              本月
            </Button>
            <Button
              type={timeFilter === "custom" ? "primary" : "default"}
              onClick={() => setTimeFilter("custom")}
            >
              自定义
            </Button>
          </Space>
          {timeFilter === "custom" && (
            <RangePicker
              value={customDateRange as any}
              onChange={(dates) => {
                setCustomDateRange(dates as RangeValue);
              }}
              format="YYYY-MM-DD"
            />
          )}
          <Space>
            <span style={{ fontWeight: 500 }}>商品分类：</span>
            <Select
              value={category}
              onChange={setCategory}
              options={categoryOptions}
              style={{ width: 150 }}
            />
          </Space>
        </Space>
      </Card>

      {/* 简单统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="销量TOP"
              value={statistics?.topProduct?.name || "暂无数据"}
              prefix={<CrownOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14", fontSize: 20 }}
              suffix={
                statistics?.topProduct ? (
                  <span style={{ fontSize: 14, color: "#666" }}>
                    ({statistics.topProduct.quantity}件)
                  </span>
                ) : null
              }
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="总销量"
              value={statistics?.totalQuantity || 0}
              prefix={<ShoppingCartOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="滞销商品"
              value={statistics?.slowMovingCount || 0}
              prefix={<WarningOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      {/* 商品销量排行榜（条形图） */}
      <Card title="商品销量排行榜 TOP 6" style={{ marginBottom: 24 }}>
        {barChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={barChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={90} />
              <Tooltip
                formatter={(value: number | undefined, name: string) => {
                  if (value === undefined) return ["¥0.00", name];
                  if (name === "销售额") {
                    return [`¥${value.toFixed(2)}`, name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="销量" fill="#1890ff" />
              <Bar dataKey="销售额" fill="#52c41a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>

      {/* 商品销量表格 */}
      <Card title="商品销量明细">
        {statistics?.allProducts && statistics.allProducts.length > 0 ? (
          <Table
            dataSource={statistics.allProducts}
            columns={columns}
            rowKey="productId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>
    </div>
  );
}
