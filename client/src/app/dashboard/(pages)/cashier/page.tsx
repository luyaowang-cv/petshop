"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Table,
  InputNumber,
  Select,
  Space,
  Tag,
  Avatar,
  Divider,
  Modal,
  message,
  Empty,
  Badge,
  Alert,
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ClearOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  UnorderedListOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/services/queries/Product";
import { fetchCustomers, CUSTOMER_KEY } from "@/services/queries/Customer";
import {
  createProductOrder,
  PRODUCT_ORDER_KEY,
} from "@/services/queries/ProductOrder";
import { updateAppointmentStatus } from "@/services/queries/Appointment";
import { Product, ProductStatus } from "@/@types/Product";
import { CreateProductOrderData } from "@/@types/ProductOrder";
import type { ColumnsType } from "antd/es/table";

const { Search } = Input;

// 购物车商品项
interface CartItem {
  product: Product;
  quantity: number;
}

// 购物车服务项
interface CartServiceItem {
  id: string;
  name: string;
  price: number;
  appointmentId: string;
}

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

// 会员等级折扣配置（后端已简化为 REGULAR / VIP 两级）
const MEMBER_DISCOUNTS = {
  REGULAR: 1.0, // 普通客户：无折扣
  VIP: 0.9, // VIP会员：9折
};

// 获取会员折扣
const getMemberDiscount = (memberLevel?: string) => {
  if (!memberLevel) return 1.0;
  return MEMBER_DISCOUNTS[memberLevel as keyof typeof MEMBER_DISCOUNTS] || 1.0;
};

export default function CashierPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 状态管理
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >();
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [serviceItem, setServiceItem] = useState<CartServiceItem | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [usePointsExchange, setUsePointsExchange] = useState(false);
  const [useBalance, setUseBalance] = useState(false); // 是否使用余额支付

  // 从URL参数中获取服务订单信息
  useEffect(() => {
    const appointmentId = searchParams.get("appointmentId");
    const customerId = searchParams.get("customerId");
    const serviceName = searchParams.get("serviceName");
    const servicePrice = searchParams.get("servicePrice");

    if (appointmentId && serviceName && servicePrice) {
      setServiceItem({
        id: appointmentId,
        name: serviceName,
        price: parseInt(servicePrice),
        appointmentId,
      });
      if (customerId) {
        setSelectedCustomerId(customerId);
      }
      message.success(`已添加服务项目：${serviceName}`);
    }
  }, [searchParams]);

  // 数据查询
  const { data: productsData, isLoading: productsLoading } = useProducts({
    pageSize: 1000,
    search: searchKeyword,
  });

  const { data: customersData } = useQuery({
    queryKey: [CUSTOMER_KEY],
    queryFn: fetchCustomers,
  });

  // 获取可用商品（仅上架状态）
  const availableProducts = useMemo(() => {
    return (
      productsData?.data?.filter((p) => p.status === ProductStatus.ACTIVE) || []
    );
  }, [productsData]);

  // 获取选中的客户信息
  const selectedCustomer = useMemo(() => {
    return customersData?.customers.find((c) => c.id === selectedCustomerId);
  }, [customersData, selectedCustomerId]);

  // 创建订单
  const createMutation = useMutation({
    mutationFn: createProductOrder,
    onSuccess: async () => {
      message.success("结算成功！");

      // 如果有服务订单，更新预约状态为已完成
      if (serviceItem?.appointmentId) {
        try {
          await updateAppointmentStatus(
            serviceItem.appointmentId,
            "COMPLETED" as any,
          );
          queryClient.invalidateQueries({ queryKey: ["appointment-fetch"] });
        } catch (error) {
          console.error("更新预约状态失败:", error);
          // 不阻断流程，只记录错误
        }
      }

      queryClient.invalidateQueries({ queryKey: [PRODUCT_ORDER_KEY] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_KEY] }); // 刷新客户数据
      setCart(new Map());
      setServiceItem(null);
      setSelectedCustomerId(undefined);
      setOrderNote("");
      setUsePointsExchange(false); // 重置积分兑换状态
      setUseBalance(false); // 重置余额支付状态
      setIsCheckoutModalOpen(false);

      // 如果是从服务订单跳转过来的，返回预约列表
      if (serviceItem?.appointmentId) {
        setTimeout(() => {
          router.push("/dashboard/appointments");
        }, 1000);
      }
    },
    onError: (error: any) => {
      console.error("结算失败:", error); // 调试日志
      console.error("错误响应:", error.response?.data); // 调试日志
      message.error(error.response?.data?.message || "结算失败");
    },
  });

  // 添加商品到购物车
  const handleAddToCart = (product: Product) => {
    const newCart = new Map(cart);
    const existingItem = newCart.get(product.id);

    if (existingItem) {
      // 检查库存
      if (existingItem.quantity >= product.stock) {
        message.warning(`${product.name} 库存不足`);
        return;
      }
      existingItem.quantity += 1;
    } else {
      if (product.stock <= 0) {
        message.warning(`${product.name} 库存不足`);
        return;
      }
      newCart.set(product.id, { product, quantity: 1 });
    }

    setCart(newCart);
    message.success(`已添加 ${product.name}`);
  };

  // 更新购物车商品数量
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const newCart = new Map(cart);
    const item = newCart.get(productId);

    if (!item) return;

    if (quantity <= 0) {
      newCart.delete(productId);
    } else if (quantity > item.product.stock) {
      message.warning(`${item.product.name} 库存不足`);
      return;
    } else {
      item.quantity = quantity;
    }

    setCart(newCart);
  };

  // 从购物车移除商品
  const handleRemoveFromCart = (productId: string) => {
    const newCart = new Map(cart);
    newCart.delete(productId);
    setCart(newCart);
  };

  // 清空购物车
  const handleClearCart = () => {
    Modal.confirm({
      title: "清空购物车",
      content: "确定要清空购物车吗？",
      onOk: () => {
        setCart(new Map());
        setServiceItem(null);
        message.success("购物车已清空");
      },
    });
  };

  // 计算原价总金额（包含服务项）
  const originalAmount = useMemo(() => {
    let total = 0;
    // 商品金额
    cart.forEach((item) => {
      total += item.product.price * item.quantity;
    });
    // 服务金额
    if (serviceItem) {
      total += serviceItem.price;
    }
    return total;
  }, [cart, serviceItem]);

  // 计算会员折扣
  const memberDiscount = useMemo(() => {
    if (!selectedCustomerId || !selectedCustomer) return 1.0;
    return getMemberDiscount(selectedCustomer.memberLevel);
  }, [selectedCustomerId, selectedCustomer]);

  // 计算优惠金额
  const discountAmount = useMemo(() => {
    return Math.floor(originalAmount * (1 - memberDiscount));
  }, [originalAmount, memberDiscount]);

  // 计算折后金额（应用会员折扣后）
  const discountedAmount = useMemo(() => {
    return originalAmount - discountAmount;
  }, [originalAmount, discountAmount]);

  // 计算积分兑换金额（最多不超过折后金额）
  const pointsExchangeAmount = useMemo(() => {
    if (!usePointsExchange || !selectedCustomer) return 0;

    const availablePoints = selectedCustomer.memberPoints;
    // 100积分 = 1元 = 100分
    const maxExchangeAmount = Math.floor(availablePoints / 100) * 100;

    // 不能超过折后金额
    return Math.min(maxExchangeAmount, discountedAmount);
  }, [usePointsExchange, selectedCustomer, discountedAmount]);

  // 计算需要扣除的积分
  const pointsToDeduct = useMemo(() => {
    // 1元 = 100积分，金额单位是分，所以需要除以100再乘以100
    return Math.floor(pointsExchangeAmount / 100) * 100;
  }, [pointsExchangeAmount]);

  // 计算实付金额（折后金额 - 积分兑换金额）
  const totalAmount = useMemo(() => {
    return discountedAmount - pointsExchangeAmount;
  }, [discountedAmount, pointsExchangeAmount]);

  // 计算使用的余额金额（最多不超过实付金额）
  const balanceUsedAmount = useMemo(() => {
    if (!useBalance || !selectedCustomer) return 0;

    const availableBalance = selectedCustomer.memberBalance;
    // 不能超过实付金额
    return Math.min(availableBalance, totalAmount);
  }, [useBalance, selectedCustomer, totalAmount]);

  // 计算现金支付金额（实付金额 - 余额支付金额）
  const cashAmount = useMemo(() => {
    return totalAmount - balanceUsedAmount;
  }, [totalAmount, balanceUsedAmount]);

  // 计算商品总数（不包含服务）
  const totalItems = useMemo(() => {
    let total = 0;
    cart.forEach((item) => {
      total += item.quantity;
    });
    return total;
  }, [cart]);

  // 结算
  const handleCheckout = () => {
    if (cart.size === 0 && !serviceItem) {
      message.warning("购物车为空，请先添加商品或服务");
      return;
    }

    // 散客也可以结算，不强制要求选择客户
    setIsCheckoutModalOpen(true);
  };

  // 确认结算
  const handleConfirmCheckout = () => {
    const items = Array.from(cart.values()).map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const orderData: CreateProductOrderData = {
      items,
    };

    // 只在选择了客户时才添加customerId
    if (selectedCustomerId) {
      orderData.customerId = selectedCustomerId;
    }

    // 只在有备注时才添加note
    if (orderNote) {
      orderData.note = orderNote;
    }

    // 只在使用积分兑换时才添加pointsUsed
    if (usePointsExchange && pointsToDeduct > 0) {
      orderData.pointsUsed = pointsToDeduct;
    }

    // 只在使用余额支付时才添加balanceUsed
    if (useBalance && balanceUsedAmount > 0) {
      orderData.balanceUsed = balanceUsedAmount;
    }

    // 收银台直接创建订单（订单会以CONFIRMED状态创建）
    // 如果有服务项，需要在订单备注中记录
    if (serviceItem) {
      orderData.note = `${orderData.note ? orderData.note + "\n" : ""}服务项目：${serviceItem.name} - ${formatPrice(serviceItem.price)}`;
    }

    console.log("发送订单数据:", orderData); // 调试日志
    createMutation.mutate(orderData);
  };

  // 商品列表表格列
  const productColumns: ColumnsType<Product> = [
    {
      title: "商品名称",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "单价",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price: number) => (
        <span style={{ fontWeight: 500, color: "#1890ff" }}>
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: "库存",
      dataIndex: "stock",
      key: "stock",
      width: 80,
      render: (stock: number, record: Product) => (
        <span style={{ color: record.isLowStock ? "#ff4d4f" : undefined }}>
          {stock} {record.unit}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<ShoppingCartOutlined />}
          onClick={() => handleAddToCart(record)}
          disabled={record.stock <= 0}
        >
          加入
        </Button>
      ),
    },
  ];

  // 购物车表格列
  const cartColumns: ColumnsType<CartItem> = [
    {
      title: "商品名称",
      dataIndex: ["product", "name"],
      key: "name",
    },
    {
      title: "单价",
      dataIndex: ["product", "price"],
      key: "price",
      width: 100,
      render: (price: number) => formatPrice(price),
    },
    {
      title: "数量",
      key: "quantity",
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={1}
          max={record.product.stock}
          value={record.quantity}
          onChange={(value) =>
            handleUpdateQuantity(record.product.id, value || 1)
          }
          size="small"
        />
      ),
    },
    {
      title: "小计",
      key: "subtotal",
      width: 100,
      render: (_, record) => (
        <span style={{ fontWeight: 500, color: "#1890ff" }}>
          {formatPrice(record.product.price * record.quantity)}
        </span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveFromCart(record.product.id)}
        />
      ),
    },
  ];

  const cartItems = Array.from(cart.values());

  // 调试日志
  console.log("购物车状态:", {
    cartSize: cart.size,
    cartItemsLength: cartItems.length,
    serviceItem: serviceItem ? serviceItem.name : null,
  });

  return (
    <div style={{ padding: "24px", height: "calc(100vh - 64px)" }}>
      {/* 顶部操作栏 */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      ></div>

      <Row gutter={16} style={{ height: "calc(100% - 56px)" }}>
        {/* 左侧：商品列表 */}
        <Col span={14} style={{ height: "100%" }}>
          <Card
            title="商品列表"
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            bodyStyle={{ flex: 1, overflow: "auto" }}
          >
            <Search
              placeholder="搜索商品名称"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={setSearchKeyword}
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={productColumns}
              dataSource={availableProducts}
              rowKey="id"
              loading={productsLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 件商品`,
              }}
              size="small"
            />
          </Card>
        </Col>

        {/* 右侧：购物车和结算 */}
        <Col span={10} style={{ height: "100%" }}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                购物车
                {totalItems > 0 && (
                  <Badge
                    count={totalItems}
                    style={{ backgroundColor: "#1890ff" }}
                  />
                )}
              </Space>
            }
            extra={
              cart.size > 0 && (
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleClearCart}
                >
                  清空
                </Button>
              )
            }
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            bodyStyle={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              padding: "16px",
            }}
          >
            {/* 客户选择 */}
            <div style={{ marginBottom: 8, flexShrink: 0 }}>
              <div style={{ marginBottom: 6, fontWeight: 500, fontSize: 13 }}>
                <UserOutlined /> 选择客户（可选）
              </div>
              <Select
                placeholder="散客交易（不选择客户）"
                style={{ width: "100%" }}
                size="middle"
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={customersData?.customers.map((c) => ({
                  label: `${c.name} - ${formatPhone(c.phone)}`,
                  value: c.id,
                }))}
              />
              {selectedCustomer && (
                <div
                  style={{
                    marginTop: 6,
                    padding: 6,
                    background: "#f0f5ff",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  <Space size="small">
                    <Avatar
                      icon={<UserOutlined />}
                      style={{ backgroundColor: "#1890ff" }}
                      size="small"
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>
                        {selectedCustomer.name}
                        {selectedCustomer.memberLevel === "VIP" && (
                          <Tag color="gold" style={{ marginLeft: 4, fontSize: 11 }}>
                            VIP会员
                          </Tag>
                        )}
                      </div>
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        余额：{formatPrice(selectedCustomer.memberBalance)} |
                        积分：{selectedCustomer.memberPoints}
                        {selectedCustomer.memberLevel === "VIP" && (
                          <span style={{ color: "#ff4d4f", marginLeft: 4 }}>
                            | 享9折优惠
                          </span>
                        )}
                      </div>
                    </div>
                  </Space>
                </div>
              )}
            </div>

            <Divider style={{ margin: "8px 0", flexShrink: 0 }} />

            {/* 购物车列表 */}
            <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
              {/* 服务项显示 */}
              {serviceItem && (
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      marginBottom: 8,
                      color: "#666",
                      fontSize: 12,
                    }}
                  >
                    服务项目
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      background: "#e6f7ff",
                      borderRadius: 8,
                      border: "1px solid #91d5ff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <ScissorOutlined
                          style={{ color: "#1890ff", fontSize: 16 }}
                        />
                        <span style={{ fontWeight: 500, fontSize: 14 }}>
                          {serviceItem.name}
                        </span>
                      </Space>
                      <Space>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#1890ff",
                            fontSize: 16,
                          }}
                        >
                          {formatPrice(serviceItem.price)}
                        </span>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => setServiceItem(null)}
                        />
                      </Space>
                    </div>
                  </div>
                </div>
              )}

              {/* 商品列表 */}
              {cart.size > 0 && (
                <div>
                  <div
                    style={{
                      fontWeight: 500,
                      marginBottom: 8,
                      color: "#666",
                      fontSize: 12,
                    }}
                  >
                    商品明细 ({cartItems.length}件)
                  </div>
                  {cartItems.length === 0 ? (
                    <div
                      style={{
                        padding: 16,
                        textAlign: "center",
                        color: "#999",
                      }}
                    >
                      购物车数据加载中...
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.product.id}
                        style={{
                          padding: "12px",
                          background: "#fff",
                          borderRadius: 8,
                          border: "1px solid #d9d9d9",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 14,
                                marginBottom: 4,
                              }}
                            >
                              {item.product.name}
                            </div>
                            <div style={{ fontSize: 12, color: "#999" }}>
                              单价：{formatPrice(item.product.price)}
                            </div>
                          </div>
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() =>
                              handleRemoveFromCart(item.product.id)
                            }
                          />
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <InputNumber
                            min={1}
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(value) =>
                              handleUpdateQuantity(item.product.id, value || 1)
                            }
                            size="small"
                            style={{ width: 80 }}
                          />
                          <span
                            style={{
                              fontWeight: 600,
                              color: "#1890ff",
                              fontSize: 16,
                            }}
                          >
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 空状态 */}
              {cart.size === 0 && !serviceItem && (
                <Empty
                  description="购物车为空"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ marginTop: 60 }}
                />
              )}
            </div>

            {/* 结算区域 */}
            <div
              style={{
                marginTop: 12,
                padding: "12px",
                background: "#fafafa",
                borderRadius: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>商品数量：</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {totalItems} 件
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13 }}>原价：</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {formatPrice(originalAmount)}
                </span>
              </div>
              {selectedCustomer && memberDiscount < 1.0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 13, color: "#ff4d4f" }}>
                    会员优惠（VIP会员9折）：
                  </span>
                  <span
                    style={{ fontSize: 13, fontWeight: 500, color: "#ff4d4f" }}
                  >
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
              )}

              {/* 积分兑换选项 */}
              {selectedCustomer && selectedCustomer.memberPoints >= 100 && (
                <div style={{ marginTop: 8, marginBottom: 6 }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <input
                          type="checkbox"
                          checked={usePointsExchange}
                          onChange={(e) =>
                            setUsePointsExchange(e.target.checked)
                          }
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: 14 }}>使用积分兑换礼品</span>
                      </Space>
                      <span style={{ fontSize: 12, color: "#999" }}>
                        可用：{selectedCustomer.memberPoints}积分
                      </span>
                    </div>
                    {usePointsExchange && pointsExchangeAmount > 0 && (
                      <div
                        style={{
                          padding: 8,
                          background: "#fff7e6",
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                      >
                        <div style={{ color: "#fa8c16" }}>
                          兑换 {formatPrice(pointsExchangeAmount)} 礼品，扣除{" "}
                          {pointsToDeduct} 积分
                        </div>
                        <div style={{ color: "#999", marginTop: 4 }}>
                          兑换规则：100积分 = ¥1
                        </div>
                      </div>
                    )}
                  </Space>
                </div>
              )}

              {/* 余额支付选项 */}
              {selectedCustomer && selectedCustomer.memberBalance > 0 && (
                <div style={{ marginTop: 8, marginBottom: 6 }}>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <input
                          type="checkbox"
                          checked={useBalance}
                          onChange={(e) => setUseBalance(e.target.checked)}
                          style={{ cursor: "pointer" }}
                        />
                        <span style={{ fontSize: 14 }}>使用储值余额支付</span>
                      </Space>
                      <span style={{ fontSize: 12, color: "#999" }}>
                        可用：{formatPrice(selectedCustomer.memberBalance)}
                      </span>
                    </div>
                    {useBalance && balanceUsedAmount > 0 && (
                      <div
                        style={{
                          padding: 8,
                          background: "#e6f7ff",
                          borderRadius: 4,
                          fontSize: 12,
                        }}
                      >
                        <div style={{ color: "#1890ff" }}>
                          使用余额 {formatPrice(balanceUsedAmount)}
                          {balanceUsedAmount < totalAmount && (
                            <span style={{ color: "#999", marginLeft: 8 }}>
                              （余额不足，剩余{formatPrice(cashAmount)}
                              用现金支付）
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Space>
                </div>
              )}

              <Divider style={{ margin: "8px 0" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 500 }}>
                  {useBalance && balanceUsedAmount > 0
                    ? "现金支付："
                    : "实付金额："}
                </span>
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#1890ff",
                  }}
                >
                  {formatPrice(cashAmount)}
                </span>
              </div>
              <Button
                type="primary"
                size="large"
                block
                icon={<CheckCircleOutlined />}
                onClick={handleCheckout}
                disabled={cart.size === 0 && !serviceItem}
              >
                结算
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 结算确认弹窗 */}
      <Modal
        title="确认结算"
        open={isCheckoutModalOpen}
        onCancel={() => setIsCheckoutModalOpen(false)}
        onOk={handleConfirmCheckout}
        confirmLoading={createMutation.isLoading}
        width={600}
      >
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>客户信息</div>
            {selectedCustomer && (
              <Space>
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1890ff" }}
                />
                <div>
                  <div>{selectedCustomer.name}</div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    {formatPhone(selectedCustomer.phone)}
                  </div>
                </div>
              </Space>
            )}
          </div>

          <Divider />

          {/* 服务项显示 */}
          {serviceItem && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>服务项目</div>
              <Alert
                message={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space>
                      <ScissorOutlined style={{ color: "#1890ff" }} />
                      <span>{serviceItem.name}</span>
                    </Space>
                    <span style={{ fontWeight: 500, color: "#1890ff" }}>
                      {formatPrice(serviceItem.price)}
                    </span>
                  </div>
                }
                type="info"
              />
            </div>
          )}

          {/* 商品明细 */}
          {cartItems.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>商品明细</div>
              <Table
                columns={[
                  {
                    title: "商品",
                    dataIndex: ["product", "name"],
                    key: "name",
                  },
                  {
                    title: "数量",
                    dataIndex: "quantity",
                    key: "quantity",
                    width: 80,
                  },
                  {
                    title: "小计",
                    key: "subtotal",
                    width: 100,
                    render: (_, record: CartItem) =>
                      formatPrice(record.product.price * record.quantity),
                  },
                ]}
                dataSource={cartItems}
                rowKey={(item) => item.product.id}
                pagination={false}
                size="small"
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>备注（可选）</div>
            <Input.TextArea
              rows={3}
              placeholder="订单备注"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />
          </div>

          {/* 金额明细 */}
          <div
            style={{
              padding: "16px",
              background: "#f0f5ff",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14 }}>原价：</span>
              <span style={{ fontSize: 14 }}>
                {formatPrice(originalAmount)}
              </span>
            </div>
            {selectedCustomer && memberDiscount < 1.0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 14, color: "#ff4d4f" }}>
                  会员优惠（VIP会员9折）：
                </span>
                <span style={{ fontSize: 14, color: "#ff4d4f" }}>
                  -{formatPrice(discountAmount)}
                </span>
              </div>
            )}
            {usePointsExchange && pointsExchangeAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 14, color: "#fa8c16" }}>
                  积分兑换（扣除{pointsToDeduct}积分）：
                </span>
                <span style={{ fontSize: 14, color: "#fa8c16" }}>
                  -{formatPrice(pointsExchangeAmount)}
                </span>
              </div>
            )}
            {useBalance && balanceUsedAmount > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 14, color: "#52c41a" }}>
                  余额支付：
                </span>
                <span style={{ fontSize: 14, color: "#52c41a" }}>
                  -{formatPrice(balanceUsedAmount)}
                </span>
              </div>
            )}
            <Divider style={{ margin: "8px 0" }} />
            {useBalance && balanceUsedAmount > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: 500 }}>
                    现金支付：
                  </span>
                  <span
                    style={{ fontSize: 20, color: "#1890ff", fontWeight: 600 }}
                  >
                    {formatPrice(cashAmount)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 14, color: "#999" }}>
                    （总计：{formatPrice(totalAmount)}）
                  </span>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 500 }}>
                  应付金额：
                </span>
                <span
                  style={{ fontSize: 24, color: "#1890ff", fontWeight: 600 }}
                >
                  {formatPrice(totalAmount)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
