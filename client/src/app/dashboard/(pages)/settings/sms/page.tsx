"use client";

import { useState, useEffect } from "react";
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
  Row,
  Col,
  Select,
  InputNumber,
  Tag,
  Collapse,
  Spin,
} from "antd";
import {
  MessageOutlined,
  SaveOutlined,
  BellOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  getSmsConfig,
  saveSmsConfig,
  sendTestSms,
} from "@/services/queries/Sms";

const { Panel } = Collapse;
const { TextArea } = Input;

export default function SmsSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [testPhone, setTestPhone] = useState("");

  // 短信服务启用状态
  const [smsEnabled, setSmsEnabled] = useState(false);

  // 自动发送场景配置
  const [autoSendScenarios, setAutoSendScenarios] = useState({
    appointmentConfirm: false,
    appointmentRemind: false,
    appointmentComplete: false,
    orderConfirm: false,
    balanceChange: false,
    birthdayGreeting: false,
  });

  // 加载配置
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setPageLoading(true);
      const config = await getSmsConfig();

      if (config) {
        setSmsEnabled(config.enabled);
        setAutoSendScenarios({
          appointmentConfirm: config.appointmentConfirmEnabled,
          appointmentRemind: config.appointmentRemindEnabled,
          appointmentComplete: config.appointmentCompleteEnabled,
          orderConfirm: config.orderConfirmEnabled,
          balanceChange: config.balanceChangeEnabled,
          birthdayGreeting: config.birthdayGreetingEnabled,
        });

        form.setFieldsValue({
          provider: config.provider.toLowerCase(),
          accessKeyId: config.accessKeyId,
          accessKeySecret: config.accessKeySecret,
          signName: config.signName,
          appointmentConfirmTemplateId: config.appointmentConfirmTemplateId,
          appointmentRemindTemplateId: config.appointmentRemindTemplateId,
          appointmentCompleteTemplateId: config.appointmentCompleteTemplateId,
          orderConfirmTemplateId: config.orderConfirmTemplateId,
          balanceChangeTemplateId: config.balanceChangeTemplateId,
          birthdayGreetingTemplateId: config.birthdayGreetingTemplateId,
          appointmentRemindHours: config.appointmentRemindHours,
        });
      }
    } catch (error) {
      console.error("加载配置失败:", error);
      message.error("加载配置失败，请刷新页面重试");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const configData = {
        enabled: smsEnabled,
        provider: values.provider.toUpperCase(),
        accessKeyId: values.accessKeyId,
        accessKeySecret: values.accessKeySecret,
        signName: values.signName,
        appointmentConfirmTemplateId: values.appointmentConfirmTemplateId,
        appointmentRemindTemplateId: values.appointmentRemindTemplateId,
        appointmentCompleteTemplateId: values.appointmentCompleteTemplateId,
        orderConfirmTemplateId: values.orderConfirmTemplateId,
        balanceChangeTemplateId: values.balanceChangeTemplateId,
        birthdayGreetingTemplateId: values.birthdayGreetingTemplateId,
        appointmentConfirmEnabled: autoSendScenarios.appointmentConfirm,
        appointmentRemindEnabled: autoSendScenarios.appointmentRemind,
        appointmentCompleteEnabled: autoSendScenarios.appointmentComplete,
        orderConfirmEnabled: autoSendScenarios.orderConfirm,
        balanceChangeEnabled: autoSendScenarios.balanceChange,
        birthdayGreetingEnabled: autoSendScenarios.birthdayGreeting,
        appointmentRemindHours: values.appointmentRemindHours,
      };

      await saveSmsConfig(configData);
      message.success("短信设置保存成功！");
    } catch (error: any) {
      console.error("保存失败:", error);
      message.error(
        error.response?.data?.message || "保存失败，请检查表单填写是否完整",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhone) {
      message.warning("请输入手机号");
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(testPhone)) {
      message.error("请输入正确的手机号格式");
      return;
    }

    try {
      setTestLoading(true);
      const result = await sendTestSms(testPhone);
      if (result.success) {
        message.success("测试短信发送成功！");
      } else {
        message.error(result.message || "测试短信发送失败");
      }
    } catch (error: any) {
      console.error("发送测试短信失败:", error);
      message.error(error.response?.data?.message || "发送测试短信失败");
    } finally {
      setTestLoading(false);
    }
  };

  const handleScenarioChange = (scenario: string, enabled: boolean) => {
    setAutoSendScenarios((prev) => ({
      ...prev,
      [scenario]: enabled,
    }));
  };

  if (pageLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" tip="加载配置中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          provider: "aliyun",
          accessKeyId: "",
          accessKeySecret: "",
          signName: "",
          appointmentRemindHours: 2,
        }}
      >
        <Row gutter={24}>
          {/* 左侧：短信服务配置 */}
          <Col span={16}>
            {/* 基础配置 */}
            <Card title="短信服务配置" style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                  padding: "16px",
                  background: "#fafafa",
                  borderRadius: 8,
                }}
              >
                <Space size="large">
                  <MessageOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 16 }}>
                      启用短信服务
                    </div>
                    <div style={{ color: "#666", fontSize: 13 }}>
                      开启后可以向客户发送短信通知
                    </div>
                  </div>
                </Space>
                <Switch
                  checked={smsEnabled}
                  onChange={setSmsEnabled}
                  checkedChildren="已启用"
                  unCheckedChildren="已禁用"
                />
              </div>

              {smsEnabled && (
                <>
                  <Form.Item
                    label="短信服务商"
                    name="provider"
                    rules={[
                      { required: smsEnabled, message: "请选择短信服务商" },
                    ]}
                  >
                    <Select placeholder="请选择短信服务商">
                      <Select.Option value="aliyun">
                        阿里云短信服务
                      </Select.Option>
                      <Select.Option value="tencent">
                        腾讯云短信服务
                      </Select.Option>
                      <Select.Option value="huawei">
                        华为云短信服务
                      </Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="AccessKey ID"
                    name="accessKeyId"
                    rules={[
                      { required: smsEnabled, message: "请输入AccessKey ID" },
                    ]}
                  >
                    <Input placeholder="请输入AccessKey ID" />
                  </Form.Item>

                  <Form.Item
                    label="AccessKey Secret"
                    name="accessKeySecret"
                    rules={[
                      {
                        required: smsEnabled,
                        message: "请输入AccessKey Secret",
                      },
                    ]}
                  >
                    <Input.Password placeholder="请输入AccessKey Secret" />
                  </Form.Item>

                  <Form.Item
                    label="短信签名"
                    name="signName"
                    rules={[
                      { required: smsEnabled, message: "请输入短信签名" },
                    ]}
                    extra="短信签名需要在服务商平台申请并审核通过，例如：【宠物店名称】"
                  >
                    <Input placeholder="例如：宠物之家" />
                  </Form.Item>

                  <Divider />

                  <Alert
                    message="测试短信发送"
                    description={
                      <div>
                        <div style={{ marginBottom: 8 }}>
                          配置完成后，建议先发送测试短信验证配置是否正确
                        </div>
                        <Space>
                          <Input
                            placeholder="输入手机号"
                            style={{ width: 200 }}
                            value={testPhone}
                            onChange={(e) => setTestPhone(e.target.value)}
                          />
                          <Button
                            type="primary"
                            size="small"
                            loading={testLoading}
                            onClick={handleTestSms}
                          >
                            发送测试短信
                          </Button>
                        </Space>
                      </div>
                    }
                    type="warning"
                    showIcon
                  />
                </>
              )}
            </Card>

            {/* 短信模板配置 */}
            {smsEnabled && (
              <Card title="短信模板配置" style={{ marginBottom: 24 }}>
                <Alert
                  message="模板说明"
                  description="短信模板需要在服务商平台申请并审核通过后才能使用。模板中可以使用变量，如：{customer}、{time}、{service}等"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Collapse defaultActiveKey={["1"]}>
                  <Panel header="预约确认短信模板" key="1">
                    <Form.Item
                      label="模板ID"
                      name="appointmentConfirmTemplateId"
                    >
                      <Input placeholder="请输入模板ID" />
                    </Form.Item>
                    <Form.Item label="模板内容预览">
                      <TextArea
                        rows={3}
                        disabled
                        value="【{sign}】尊敬的{customer}，您已成功预约{service}服务，预约时间：{time}，期待您的光临！"
                      />
                    </Form.Item>
                  </Panel>

                  <Panel header="预约提醒短信模板" key="2">
                    <Form.Item
                      label="模板ID"
                      name="appointmentRemindTemplateId"
                    >
                      <Input placeholder="请输入模板ID" />
                    </Form.Item>
                    <Form.Item label="模板内容预览">
                      <TextArea
                        rows={3}
                        disabled
                        value="【{sign}】{customer}您好，您预约的{service}服务将在{time}开始，请准时到店，如需改期请提前联系我们。"
                      />
                    </Form.Item>
                  </Panel>

                  <Panel header="服务完成短信模板" key="3">
                    <Form.Item
                      label="模板ID"
                      name="appointmentCompleteTemplateId"
                    >
                      <Input placeholder="请输入模板ID" />
                    </Form.Item>
                    <Form.Item label="模板内容预览">
                      <TextArea
                        rows={3}
                        disabled
                        value="【{sign}】{customer}您好，您的{pet}已完成{service}服务，感谢您的信任！本次消费{amount}元，期待下次光临。"
                      />
                    </Form.Item>
                  </Panel>

                  <Panel header="余额变动短信模板" key="4">
                    <Form.Item label="模板ID" name="balanceChangeTemplateId">
                      <Input placeholder="请输入模板ID" />
                    </Form.Item>
                    <Form.Item label="模板内容预览">
                      <TextArea
                        rows={3}
                        disabled
                        value="【{sign}】{customer}您好，您已{type}{amount}元，当前余额{balance}元，积分{points}分。感谢您的支持！"
                      />
                    </Form.Item>
                  </Panel>

                  <Panel header="生日祝福短信模板" key="5">
                    <Form.Item label="模板ID" name="birthdayGreetingTemplateId">
                      <Input placeholder="请输入模板ID" />
                    </Form.Item>
                    <Form.Item label="模板内容预览">
                      <TextArea
                        rows={3}
                        disabled
                        value="【{sign}】{customer}您好，今天是{pet}的生日，祝{pet}生日快乐！我们为您准备了生日礼物，欢迎到店领取。"
                      />
                    </Form.Item>
                  </Panel>
                </Collapse>
              </Card>
            )}

            {/* 自动发送规则 */}
            {smsEnabled && (
              <Card title="自动发送规则" style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: 8,
                      marginBottom: 12,
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
                        <CalendarOutlined style={{ color: "#1890ff" }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>预约确认通知</div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            客户预约成功后立即发送确认短信
                          </div>
                        </div>
                      </Space>
                      <Switch
                        checked={autoSendScenarios.appointmentConfirm}
                        onChange={(checked) =>
                          handleScenarioChange("appointmentConfirm", checked)
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: autoSendScenarios.appointmentRemind
                          ? 12
                          : 0,
                      }}
                    >
                      <Space>
                        <BellOutlined style={{ color: "#faad14" }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>预约提醒通知</div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            在预约时间前提醒客户
                          </div>
                        </div>
                      </Space>
                      <Switch
                        checked={autoSendScenarios.appointmentRemind}
                        onChange={(checked) =>
                          handleScenarioChange("appointmentRemind", checked)
                        }
                      />
                    </div>
                    {autoSendScenarios.appointmentRemind && (
                      <div style={{ paddingLeft: 32 }}>
                        <Form.Item
                          label="提前提醒时间"
                          name="appointmentRemindHours"
                          style={{ marginBottom: 0 }}
                        >
                          <Space>
                            <InputNumber
                              min={1}
                              max={48}
                              style={{ width: 100 }}
                            />
                            <span>小时</span>
                          </Space>
                        </Form.Item>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: 8,
                      marginBottom: 12,
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
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>服务完成通知</div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            服务完成后发送感谢短信
                          </div>
                        </div>
                      </Space>
                      <Switch
                        checked={autoSendScenarios.appointmentComplete}
                        onChange={(checked) =>
                          handleScenarioChange("appointmentComplete", checked)
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: 8,
                      marginBottom: 12,
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
                        <ShoppingOutlined style={{ color: "#1890ff" }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>订单确认通知</div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            商品订单确认后发送通知
                          </div>
                        </div>
                      </Space>
                      <Switch
                        checked={autoSendScenarios.orderConfirm}
                        onChange={(checked) =>
                          handleScenarioChange("orderConfirm", checked)
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: 8,
                      marginBottom: 12,
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
                        <UserOutlined style={{ color: "#722ed1" }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>余额变动通知</div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            每次充值消费后发送通知
                          </div>
                        </div>
                      </Space>
                      <Switch
                        checked={autoSendScenarios.balanceChange}
                        onChange={(checked) =>
                          handleScenarioChange("balanceChange", checked)
                        }
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px",
                      background: "#fafafa",
                      borderRadius: 8,
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
                        <MessageOutlined style={{ color: "#eb2f96" }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>生日祝福通知</div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            宠物生日当天发送祝福短信
                          </div>
                        </div>
                      </Space>
                      <Switch
                        checked={autoSendScenarios.birthdayGreeting}
                        onChange={(checked) =>
                          handleScenarioChange("birthdayGreeting", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </Col>

          {/* 右侧：使用说明和状态 */}
          <Col span={8}>
            <Card title="使用说明" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, lineHeight: 1.8 }}>
                <h4 style={{ marginTop: 0 }}>📱 短信服务商申请</h4>
                <p style={{ color: "#666" }}>
                  <strong>阿里云：</strong>
                  <br />
                  <a
                    href="https://www.aliyun.com/product/sms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.aliyun.com/product/sms
                  </a>
                </p>
                <p style={{ color: "#666" }}>
                  <strong>腾讯云：</strong>
                  <br />
                  <a
                    href="https://cloud.tencent.com/product/sms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://cloud.tencent.com/product/sms
                  </a>
                </p>

                <Divider />

                <h4>📝 配置步骤</h4>
                <ol style={{ color: "#666", paddingLeft: 20 }}>
                  <li>在服务商平台注册账号并实名认证</li>
                  <li>申请短信签名（需要营业执照）</li>
                  <li>申请短信模板（需要审核）</li>
                  <li>获取AccessKey ID和Secret</li>
                  <li>在本页面配置并测试</li>
                </ol>

                <Divider />

                <h4>💰 费用说明</h4>
                <p style={{ color: "#666" }}>
                  短信按条计费，通常：
                  <br />
                  • 验证码短信：0.03-0.05元/条
                  <br />
                  • 通知短信：0.04-0.06元/条
                  <br />• 营销短信：0.05-0.08元/条
                </p>

                <Alert
                  message="温馨提示"
                  description="建议合理配置自动发送规则，避免不必要的短信费用支出。"
                  type="warning"
                  showIcon
                  style={{ fontSize: 12 }}
                />
              </div>
            </Card>

            <Card title="当前状态">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{
                    padding: "12px",
                    background: smsEnabled ? "#f6ffed" : "#fafafa",
                    border: `1px solid ${smsEnabled ? "#b7eb8f" : "#d9d9d9"}`,
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>短信服务</span>
                    <Tag color={smsEnabled ? "success" : "default"}>
                      {smsEnabled ? "已启用" : "未启用"}
                    </Tag>
                  </div>
                </div>

                {smsEnabled && (
                  <>
                    <Divider style={{ margin: "12px 0" }} />
                    <div style={{ fontSize: 12, color: "#666" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <span>已启用场景：</span>
                        <span style={{ fontWeight: 500 }}>
                          {
                            Object.values(autoSendScenarios).filter(Boolean)
                              .length
                          }{" "}
                          个
                        </span>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        {autoSendScenarios.appointmentConfirm && (
                          <Tag
                            color="blue"
                            style={{ marginBottom: 4, fontSize: 11 }}
                          >
                            预约确认
                          </Tag>
                        )}
                        {autoSendScenarios.appointmentRemind && (
                          <Tag
                            color="orange"
                            style={{ marginBottom: 4, fontSize: 11 }}
                          >
                            预约提醒
                          </Tag>
                        )}
                        {autoSendScenarios.appointmentComplete && (
                          <Tag
                            color="green"
                            style={{ marginBottom: 4, fontSize: 11 }}
                          >
                            服务完成
                          </Tag>
                        )}
                        {autoSendScenarios.orderConfirm && (
                          <Tag
                            color="blue"
                            style={{ marginBottom: 4, fontSize: 11 }}
                          >
                            订单确认
                          </Tag>
                        )}
                        {autoSendScenarios.balanceChange && (
                          <Tag
                            color="purple"
                            style={{ marginBottom: 4, fontSize: 11 }}
                          >
                            余额变动
                          </Tag>
                        )}
                        {autoSendScenarios.birthdayGreeting && (
                          <Tag
                            color="magenta"
                            style={{ marginBottom: 4, fontSize: 11 }}
                          >
                            生日祝福
                          </Tag>
                        )}
                      </div>
                    </div>
                  </>
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
