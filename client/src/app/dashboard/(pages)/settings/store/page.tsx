"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
  Row,
  Col,
} from "antd";
import {
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

interface StoreInfo {
  name: string;
  phone: string;
  address: string;
  businessHours: string;
  description: string;
}

const defaultStoreInfo: StoreInfo = {
  name: "爱尚宠物店",
  phone: "138-8888-8888",
  address: "河北省邯郸市魏县",
  businessHours: "周一至周日 09:00-21:00",
  description: "专业的宠物服务，为您的爱宠提供最优质的照顾。",
};

export default function StoreSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(defaultStoreInfo);

  const handleEdit = () => {
    form.setFieldsValue(storeInfo);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      // TODO: 调用 API 持久化门店信息
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStoreInfo(values);
      message.success("保存成功");
      setIsEditing(false);
    } catch (error) {
      // validateFields 校验失败时无需提示
      if ((error as any)?.errorFields) return;
      message.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(storeInfo);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div style={{ padding: "24px" }}>
        <Card title="编辑门店信息" bordered={false}>
          <Form form={form} layout="vertical" style={{ maxWidth: 640 }}>
            <Form.Item
              label="门店名称"
              name="name"
              rules={[{ required: true, message: "请输入门店名称" }]}
            >
              <Input placeholder="请输入门店名称" />
            </Form.Item>
            <Form.Item label="联系电话" name="phone">
              <Input placeholder="请输入联系电话" />
            </Form.Item>
            <Form.Item label="营业时间" name="businessHours">
              <Input placeholder="例如：周一至周日 09:00-21:00" />
            </Form.Item>
            <Form.Item label="门店地址" name="address">
              <Input placeholder="请输入门店地址" />
            </Form.Item>
            <Form.Item label="门店简介" name="description">
              <TextArea rows={4} placeholder="请输入门店简介" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Space>
                <Button type="primary" loading={loading} onClick={handleSave}>
                  保存
                </Button>
                <Button onClick={handleCancel}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="门店信息"
        bordered={false}
        extra={
          <Button type="link" icon={<EditOutlined />} onClick={handleEdit}>
            编辑
          </Button>
        }
      >
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <ShopOutlined
                style={{ fontSize: 24, color: "#1890ff", marginRight: 16 }}
              />
              <div>
                <div style={{ color: "#666", fontSize: 14 }}>门店名称</div>
                <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>
                  {storeInfo.name}
                </div>
              </div>
            </div>
          </Col>

          <Col span={12}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <PhoneOutlined
                style={{ fontSize: 20, color: "#52c41a", marginRight: 12 }}
              />
              <div>
                <div style={{ color: "#666", fontSize: 14 }}>联系电话</div>
                <div style={{ fontSize: 16, marginTop: 4 }}>
                  {storeInfo.phone}
                </div>
              </div>
            </div>
          </Col>

          <Col span={12}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <ClockCircleOutlined
                style={{ fontSize: 20, color: "#fa8c16", marginRight: 12 }}
              />
              <div>
                <div style={{ color: "#666", fontSize: 14 }}>营业时间</div>
                <div style={{ fontSize: 16, marginTop: 4 }}>
                  {storeInfo.businessHours}
                </div>
              </div>
            </div>
          </Col>

          <Col span={24}>
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <EnvironmentOutlined
                style={{
                  fontSize: 20,
                  color: "#722ed1",
                  marginRight: 12,
                  marginTop: 4,
                }}
              />
              <div>
                <div style={{ color: "#666", fontSize: 14 }}>门店地址</div>
                <div style={{ fontSize: 16, marginTop: 4 }}>
                  {storeInfo.address}
                </div>
              </div>
            </div>
          </Col>

          <Col span={24}>
            <div>
              <div style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>
                门店简介
              </div>
              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "#595959",
                  padding: 16,
                  background: "#fafafa",
                  borderRadius: 8,
                }}
              >
                {storeInfo.description}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
