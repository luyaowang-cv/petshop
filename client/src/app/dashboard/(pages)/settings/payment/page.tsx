"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  message,
  Divider,
  Alert,
  Upload,
  Row,
  Col,
  Tabs,
} from "antd";
import {
  WechatOutlined,
  AlipayOutlined,
  DollarOutlined,
  QrcodeOutlined,
  SaveOutlined,
  UploadOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";

export default function PaymentSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 支付方式启用状态
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    wechat: false,
    alipay: false,
    card: false,
  });

  // 二维码文件列表
  const [wechatQRCode, setWechatQRCode] = useState<UploadFile[]>([]);
  const [alipayQRCode, setAlipayQRCode] = useState<UploadFile[]>([]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // 这里应该调用API保存设置
      console.log("保存支付设置:", { ...values, paymentMethods });

      message.success("支付设置保存成功！");
    } catch (error) {
      console.error("保存失败:", error);
      message.error("请检查表单填写是否完整");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (method: string, enabled: boolean) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: enabled,
    }));
  };

  return (
    <div style={{ padding: "24px" }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          wechatMerchantId: "",
          wechatApiKey: "",
          alipayAppId: "",
          alipayPrivateKey: "",
        }}
      >
        <Row gutter={24}>
          {/* 左侧：支付方式配置 */}
          <Col span={16}>
            <Card title="支付方式配置" style={{ marginBottom: 24 }}>
              {/* 现金支付 */}
              <div
                style={{
                  padding: "16px",
                  background: "#fafafa",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Space size="large">
                    <DollarOutlined
                      style={{ fontSize: 32, color: "#52c41a" }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16 }}>
                        现金支付
                      </div>
                      <div style={{ color: "#666", fontSize: 13 }}>
                        传统现金收款方式
                      </div>
                    </div>
                  </Space>
                  <Switch
                    checked={paymentMethods.cash}
                    onChange={(checked) =>
                      handlePaymentMethodChange("cash", checked)
                    }
                    checkedChildren="已启用"
                    unCheckedChildren="已禁用"
                  />
                </div>
              </div>

              {/* 刷卡支付 */}
              <div
                style={{
                  padding: "16px",
                  background: "#fafafa",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Space size="large">
                    <CreditCardOutlined
                      style={{ fontSize: 32, color: "#1890ff" }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16 }}>
                        刷卡支付
                      </div>
                      <div style={{ color: "#666", fontSize: 13 }}>
                        银行卡POS机刷卡
                      </div>
                    </div>
                  </Space>
                  <Switch
                    checked={paymentMethods.card}
                    onChange={(checked) =>
                      handlePaymentMethodChange("card", checked)
                    }
                    checkedChildren="已启用"
                    unCheckedChildren="已禁用"
                  />
                </div>
              </div>

              <Divider />

              {/* 微信支付 */}
              <div
                style={{
                  padding: "16px",
                  background: "#fafafa",
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: paymentMethods.wechat ? 16 : 0,
                  }}
                >
                  <Space size="large">
                    <WechatOutlined
                      style={{ fontSize: 32, color: "#07c160" }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16 }}>
                        微信支付
                      </div>
                      <div style={{ color: "#666", fontSize: 13 }}>
                        扫码收款，需要微信商户号
                      </div>
                    </div>
                  </Space>
                  <Switch
                    checked={paymentMethods.wechat}
                    onChange={(checked) =>
                      handlePaymentMethodChange("wechat", checked)
                    }
                    checkedChildren="已启用"
                    unCheckedChildren="已禁用"
                  />
                </div>

                {paymentMethods.wechat && (
                  <div
                    style={{
                      paddingTop: 16,
                      borderTop: "1px solid #e8e8e8",
                    }}
                  >
                    <Form.Item
                      label="微信商户号"
                      name="wechatMerchantId"
                      rules={[
                        {
                          required: paymentMethods.wechat,
                          message: "请输入微信商户号",
                        },
                      ]}
                    >
                      <Input placeholder="请输入微信商户号" />
                    </Form.Item>
                    <Form.Item
                      label="API密钥"
                      name="wechatApiKey"
                      rules={[
                        {
                          required: paymentMethods.wechat,
                          message: "请输入API密钥",
                        },
                      ]}
                    >
                      <Input.Password placeholder="请输入API密钥" />
                    </Form.Item>
                    <Form.Item label="收款二维码（可选）">
                      <Upload
                        listType="picture-card"
                        fileList={wechatQRCode}
                        onChange={({ fileList }) => setWechatQRCode(fileList)}
                        maxCount={1}
                        beforeUpload={() => false}
                      >
                        {wechatQRCode.length === 0 && (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>上传二维码</div>
                          </div>
                        )}
                      </Upload>
                      <div
                        style={{ color: "#999", fontSize: 12, marginTop: 8 }}
                      >
                        上传微信收款二维码，方便客户扫码支付
                      </div>
                    </Form.Item>
                  </div>
                )}
              </div>

              {/* 支付宝支付 */}
              <div
                style={{
                  padding: "16px",
                  background: "#fafafa",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: paymentMethods.alipay ? 16 : 0,
                  }}
                >
                  <Space size="large">
                    <AlipayOutlined
                      style={{ fontSize: 32, color: "#1677ff" }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 16 }}>
                        支付宝支付
                      </div>
                      <div style={{ color: "#666", fontSize: 13 }}>
                        扫码收款，需要支付宝应用ID
                      </div>
                    </div>
                  </Space>
                  <Switch
                    checked={paymentMethods.alipay}
                    onChange={(checked) =>
                      handlePaymentMethodChange("alipay", checked)
                    }
                    checkedChildren="已启用"
                    unCheckedChildren="已禁用"
                  />
                </div>

                {paymentMethods.alipay && (
                  <div
                    style={{
                      paddingTop: 16,
                      borderTop: "1px solid #e8e8e8",
                    }}
                  >
                    <Form.Item
                      label="支付宝应用ID"
                      name="alipayAppId"
                      rules={[
                        {
                          required: paymentMethods.alipay,
                          message: "请输入支付宝应用ID",
                        },
                      ]}
                    >
                      <Input placeholder="请输入支付宝应用ID" />
                    </Form.Item>
                    <Form.Item
                      label="应用私钥"
                      name="alipayPrivateKey"
                      rules={[
                        {
                          required: paymentMethods.alipay,
                          message: "请输入应用私钥",
                        },
                      ]}
                    >
                      <Input.TextArea rows={4} placeholder="请输入应用私钥" />
                    </Form.Item>
                    <Form.Item label="收款二维码（可选）">
                      <Upload
                        listType="picture-card"
                        fileList={alipayQRCode}
                        onChange={({ fileList }) => setAlipayQRCode(fileList)}
                        maxCount={1}
                        beforeUpload={() => false}
                      >
                        {alipayQRCode.length === 0 && (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>上传二维码</div>
                          </div>
                        )}
                      </Upload>
                      <div
                        style={{ color: "#999", fontSize: 12, marginTop: 8 }}
                      >
                        上传支付宝收款二维码，方便客户扫码支付
                      </div>
                    </Form.Item>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* 右侧：使用说明 */}
          <Col span={8}>
            <Card title="使用说明" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                <h4 style={{ marginTop: 0 }}>💰 现金支付</h4>
                <p style={{ color: "#666" }}>
                  最基础的支付方式，无需任何配置，直接启用即可使用。
                </p>

                <h4>💳 刷卡支付</h4>
                <p style={{ color: "#666" }}>
                  适用于有POS机的门店，客户可以使用银行卡刷卡支付。
                </p>

                <h4>📱 微信支付</h4>
                <p style={{ color: "#666" }}>
                  需要申请微信商户号，配置后可以使用扫码收款功能。
                  <br />
                  申请地址：
                  <a
                    href="https://pay.weixin.qq.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    pay.weixin.qq.com
                  </a>
                </p>

                <h4>🔵 支付宝支付</h4>
                <p style={{ color: "#666" }}>
                  需要申请支付宝开放平台应用，配置后可以使用扫码收款功能。
                  <br />
                  申请地址：
                  <a
                    href="https://open.alipay.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    open.alipay.com
                  </a>
                </p>

                <Divider />

                <Alert
                  message="温馨提示"
                  description="在线支付配置较为复杂，如果您不熟悉操作，建议先使用现金和刷卡支付，或联系技术支持协助配置。"
                  type="warning"
                  showIcon
                  style={{ fontSize: 12 }}
                />
              </div>
            </Card>

            <Card title="当前启用的支付方式">
              <Space direction="vertical" style={{ width: "100%" }}>
                {paymentMethods.cash && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                      borderRadius: 4,
                    }}
                  >
                    <Space>
                      <DollarOutlined style={{ color: "#52c41a" }} />
                      <span>现金支付</span>
                    </Space>
                  </div>
                )}
                {paymentMethods.card && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#e6f7ff",
                      border: "1px solid #91d5ff",
                      borderRadius: 4,
                    }}
                  >
                    <Space>
                      <CreditCardOutlined style={{ color: "#1890ff" }} />
                      <span>刷卡支付</span>
                    </Space>
                  </div>
                )}
                {paymentMethods.wechat && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#f0f9ff",
                      border: "1px solid #91d5ff",
                      borderRadius: 4,
                    }}
                  >
                    <Space>
                      <WechatOutlined style={{ color: "#07c160" }} />
                      <span>微信支付</span>
                    </Space>
                  </div>
                )}
                {paymentMethods.alipay && (
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#e6f7ff",
                      border: "1px solid #91d5ff",
                      borderRadius: 4,
                    }}
                  >
                    <Space>
                      <AlipayOutlined style={{ color: "#1677ff" }} />
                      <span>支付宝支付</span>
                    </Space>
                  </div>
                )}
                {!paymentMethods.cash &&
                  !paymentMethods.card &&
                  !paymentMethods.wechat &&
                  !paymentMethods.alipay && (
                    <div style={{ textAlign: "center", color: "#999" }}>
                      暂无启用的支付方式
                    </div>
                  )}
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>

      {/* 底部操作按钮 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          left: 220,
          padding: "16px 24px",
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          zIndex: 999,
        }}
      >
        <Space>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
          >
            保存设置
          </Button>
          <Button size="large" onClick={() => form.resetFields()}>
            重置
          </Button>
        </Space>
      </div>
    </div>
  );
}
