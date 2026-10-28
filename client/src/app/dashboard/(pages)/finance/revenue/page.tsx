"use client";

import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Spin,
  Empty,
  Button,
  DatePicker,
} from "antd";
import type { Dayjs } from "dayjs";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ScissorOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  fetchRevenueStatistics,
  REVENUE_STATISTICS_KEY,
} from "@/services/queries/Finance";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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

const COLORS = ["#52c41a", "#1890ff"];

export default function RevenueStatsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [customDateRange, setCustomDateRange] = useState<RangeValue>(null);

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

  // 获取收入统计数据
  const { data: statistics, isLoading } = useQuery({
    queryKey: [REVENUE_STATISTICS_KEY, dateRange.startDate, dateRange.endDate],
    queryFn: () => fetchRevenueStatistics(dateRange),
  });

  const formatCurrency = (value: number) => {
    return `¥${value.toFixed(2)}`;
  };

  // 格式化趋势数据
  const trendChartData =
    statistics?.revenueTrend.map((item) => ({
      date: dayjs(item.date).format("MM-DD"),
      商品收入: item.productRevenue,
      服务收入: item.serviceRevenue,
      总收入: item.totalRevenue,
    })) || [];

  // 饼图数据
  const pieChartData = [
    { name: "商品收入", value: statistics?.productRevenue || 0 },
    { name: "服务收入", value: statistics?.serviceRevenue || 0 },
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
      {/* 时间筛选 */}
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
        </Space>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总收入"
              value={statistics?.totalRevenue || 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品收入"
              value={statistics?.productRevenue || 0}
              precision={2}
              prefix={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="服务收入"
              value={statistics?.serviceRevenue || 0}
              precision={2}
              prefix={<ScissorOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单数"
              value={statistics?.totalOrders || 0}
              prefix={<FileTextOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 收入趋势折线图 */}
      <Card title="收入趋势" style={{ marginBottom: 24 }}>
        {trendChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number | undefined) =>
                  value !== undefined ? `¥${value.toFixed(2)}` : "¥0.00"
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="商品收入"
                stroke="#52c41a"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="服务收入"
                stroke="#1890ff"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="总收入"
                stroke="#722ed1"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>

      {/* 收入构成饼图 */}
      <Card title="收入构成">
        {statistics &&
        (statistics.productRevenue > 0 || statistics.serviceRevenue > 0) ? (
          <Row gutter={16}>
            <Col span={12}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${((percent || 0) * 100).toFixed(1)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value !== undefined ? `¥${value.toFixed(2)}` : "¥0.00"
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
            <Col span={12}>
              <div style={{ padding: "40px 20px" }}>
                <Row gutter={[16, 24]}>
                  <Col span={24}>
                    <Card size="small">
                      <Statistic
                        title="商品收入占比"
                        value={
                          statistics.totalRevenue > 0
                            ? (statistics.productRevenue /
                                statistics.totalRevenue) *
                              100
                            : 0
                        }
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: "#52c41a" }}
                      />
                      <div style={{ marginTop: 8, color: "#666" }}>
                        订单数：{statistics.productOrders}
                      </div>
                    </Card>
                  </Col>
                  <Col span={24}>
                    <Card size="small">
                      <Statistic
                        title="服务收入占比"
                        value={
                          statistics.totalRevenue > 0
                            ? (statistics.serviceRevenue /
                                statistics.totalRevenue) *
                              100
                            : 0
                        }
                        precision={1}
                        suffix="%"
                        valueStyle={{ color: "#1890ff" }}
                      />
                      <div style={{ marginTop: 8, color: "#666" }}>
                        订单数：{statistics.serviceOrders}
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>
    </div>
  );
}
