"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Select,
  message,
  Statistic,
  Row,
  Col,
  DatePicker,
  Popconfirm,
  Avatar,
  Descriptions,
  Divider,
} from "antd";
import {
  EyeOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProductOrders,
  updateProductOrderStatus,
  PRODUCT_ORDER_KEY,
} from "@/services/queries/ProductOrder";
import { fetchCustomers, CUSTOMER_KEY } from "@/services/queries/Customer";
import { ProductOrder, ProductOrderStatus } from "@/@types/ProductOrder";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const { RangePicker } = DatePicker;

// 状态标签配置（简化版：只有已支付和已完成）
const statusConfig = {
  [ProductOrderStatus.PENDING]: { color: "orange", text: "待支付" }, // 保留但不使用
  [ProductOrderStatus.CONFIRMED]: { color: "blue", text: "已支付" },
  [ProductOrderStatus.COMPLETED]: { color: "green", text: "已完成" },
  [ProductOrderStatus.CANCELED]: { color: "red", text: "已取消" }, // 保留但不使用
};

// 格式化价格（分转元）
const formatPrice = (price: number) => {
  return `¥${(price / 100).toFixed(2)}`;
};

// 格式化手机号（提取后11位）
const formatPhone = (phone: string) => {
  if (!phone) return "";
  const match = phone.match(/\d{11}$/);
  return match ? match[0] : phone;
};

// 生成订单编号（PS + 年月日时分秒）
const generateOrderNumber = (date: string) => {
  return "PS" + dayjs(date).format("YYYYMMDDHHmmss");
};

export default function OrdersPage() {
  const queryClient = useQueryClient();

  // 状态管理
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    ProductOrderStatus | undefined
  >();
  const [dateRange, setDateRange] = useState<[string, string] | undefined>();

  // 数据查询
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: [
      PRODUCT_ORDER_KEY,
      {
        status: statusFilter,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
      },
    ],
    queryFn: () =>
      fetchProductOrders({
        status: statusFilter,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
      }),
  });

  const { data: customersData } = useQuery({
    queryKey: [CUSTOMER_KEY],
    queryFn: fetchCustomers,
  });

  // 更新订单状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductOrderStatus }) =>
      updateProductOrderStatus(id, status),
    onSuccess: () => {
      message.success("订单状态更新成功");
      queryClient.invalidateQueries({ queryKey: [PRODUCT_ORDER_KEY] });
      setIsDetailModalOpen(false);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "订单状态更新失败");
    },
  });

  // 统计数据
  const statistics = useMemo(() => {
    const orders = ordersData?.orders || [];
    const total = orders.length;
    const confirmed = orders.filter(
      (o) => o.status === ProductOrderStatus.CONFIRMED,
    ).length;
    const completed = orders.filter(
      (o) => o.status === ProductOrderStatus.COMPLETED,
    ).length;

    // 今日销售额（已支付和已完成订单）
    const today = dayjs().format("YYYY-MM-DD");
    const todaySales = orders
      .filter(
        (o) =>
          (o.status === ProductOrderStatus.CONFIRMED ||
            o.status === ProductOrderStatus.COMPLETED) &&
          dayjs(o.createdAt).format("YYYY-MM-DD") === today,
      )
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return { total, confirmed, completed, todaySales };
  }, [ordersData]);

  // 查看订单详情
  const handleViewDetail = (order: ProductOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // 更新订单状态
  const handleUpdateStatus = (status: ProductOrderStatus) => {
    if (selectedOrder) {
      updateStatusMutation.mutate({ id: selectedOrder.id, status });
    }
  };

  // 获取客户信息
  const getCustomerInfo = (customerId: string) => {
    return customersData?.customers.find((c) => c.id === customerId);
  };

  // 表格列定义
  const columns: ColumnsType<ProductOrder> = [
    {
      title: "订单时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date: string, record: ProductOrder) => {
        const orderNumber = generateOrderNumber(date);
        return (
          <div title={`订单编号：${orderNumber}`} style={{ cursor: "help" }}>
            {dayjs(date).format("YYYY-MM-DD HH:mm")}
          </div>
        );
      },
    },
    {
      title: "客户信息",
      dataIndex: "customerId",
      key: "customer",
      width: 200,
      render: (customerId: string | undefined) => {
        if (!customerId) {
          return (
            <Tag color="default" style={{ fontSize: 12 }}>
              散客
            </Tag>
          );
        }
        const customer = getCustomerInfo(customerId);
        if (!customer) return "-";
        return (
          <Space>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            />
            <div>
              <div style={{ fontWeight: 500 }}>{customer.name}</div>
              <div style={{ fontSize: "12px", color: "#999" }}>
                {formatPhone(customer.phone)}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: "商品明细",
      dataIndex: "items",
      key: "items",
      render: (items: ProductOrder["items"]) => (
        <div>
          {items.map((item, index) => (
            <div key={index} style={{ fontSize: "12px" }}>
              {item.productName} × {item.quantity}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "总金额",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (amount: number) => (
        <span style={{ fontWeight: 500, color: "#1890ff" }}>
          {formatPrice(amount)}
        </span>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: ProductOrderStatus) => (
        <Tag color={statusConfig[status].color}>
          {statusConfig[status].text}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === ProductOrderStatus.CONFIRMED && (
            <Button
              type="link"
              size="small"
              onClick={() =>
                updateStatusMutation.mutate({
                  id: record.id,
                  status: ProductOrderStatus.COMPLETED,
                })
              }
            >
              完成
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={statistics.total}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已支付"
              value={statistics.confirmed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={statistics.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日销售额"
              value={statistics.todaySales / 100}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* 订单列表 */}
      <Card
        title="商品订单"
        extra={
          <Space>
            <Select
              placeholder="订单状态"
              style={{ width: 120 }}
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value={ProductOrderStatus.CONFIRMED}>
                已支付
              </Select.Option>
              <Select.Option value={ProductOrderStatus.COMPLETED}>
                已完成
              </Select.Option>
            </Select>
            <RangePicker
              onChange={(dates) => {
                if (dates) {
                  setDateRange([
                    dates[0]!.format("YYYY-MM-DD"),
                    dates[1]!.format("YYYY-MM-DD"),
                  ]);
                } else {
                  setDateRange(undefined);
                }
              }}
            />
          </Space>
        }
      >
        <div style={{ marginBottom: 16, color: "#666", fontSize: 12 }}>
          💡 提示：收银台结算后订单自动为"已支付"状态，可标记为"已完成"
        </div>
        <Table
          columns={columns}
          dataSource={ordersData?.orders || []}
          rowKey="id"
          loading={ordersLoading}
          pagination={{
            total: ordersData?.meta.total || 0,
            pageSize: ordersData?.meta.pageSize || 10,
            current: ordersData?.meta.page || 1,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={isDetailModalOpen}
        onCancel={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={
          selectedOrder?.status === ProductOrderStatus.CONFIRMED
            ? [
                <Button
                  key="cancel"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  关闭
                </Button>,
                <Popconfirm
                  key="complete"
                  title="完成订单"
                  description="确定要完成这个订单吗？"
                  onConfirm={() =>
                    handleUpdateStatus(ProductOrderStatus.COMPLETED)
                  }
                >
                  <Button
                    type="primary"
                    loading={updateStatusMutation.isPending}
                  >
                    完成订单
                  </Button>
                </Popconfirm>,
              ]
            : [
                <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
                  关闭
                </Button>,
              ]
        }
        width={700}
      >
        {selectedOrder && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="订单编号" span={2}>
                {generateOrderNumber(selectedOrder.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="订单时间" span={2}>
                {dayjs(selectedOrder.createdAt).format("YYYY-MM-DD HH:mm:ss")}
              </Descriptions.Item>
              <Descriptions.Item label="客户信息" span={2}>
                {(() => {
                  if (!selectedOrder.customerId) {
                    return <Tag color="default">散客</Tag>;
                  }
                  const customer = getCustomerInfo(selectedOrder.customerId);
                  return customer ? (
                    <Space>
                      <Avatar
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#1890ff" }}
                      />
                      <div>
                        <div>{customer.name}</div>
                        <div style={{ fontSize: "12px", color: "#999" }}>
                          {formatPhone(customer.phone)}
                        </div>
                      </div>
                    </Space>
                  ) : (
                    "-"
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="订单状态" span={2}>
                <Tag color={statusConfig[selectedOrder.status].color}>
                  {statusConfig[selectedOrder.status].text}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider>商品明细</Divider>
            <Table
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "商品名称",
                  dataIndex: "productName",
                  key: "productName",
                },
                {
                  title: "单价",
                  dataIndex: "price",
                  key: "price",
                  render: (price: number) => formatPrice(price),
                },
                {
                  title: "数量",
                  dataIndex: "quantity",
                  key: "quantity",
                },
                {
                  title: "小计",
                  dataIndex: "subtotal",
                  key: "subtotal",
                  render: (subtotal: number) => formatPrice(subtotal),
                },
              ]}
            />

            <div style={{ textAlign: "right", marginTop: 16, fontSize: 16 }}>
              <span style={{ fontWeight: 500 }}>
                总金额：
                <span style={{ color: "#1890ff", fontSize: 20 }}>
                  {formatPrice(selectedOrder.totalAmount)}
                </span>
              </span>
            </div>

            {selectedOrder.note && (
              <>
                <Divider>备注</Divider>
                <p>{selectedOrder.note}</p>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
