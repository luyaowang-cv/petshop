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
  Divider,
} from "antd";
import {
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;

interface StoreInfo {
  name: string;
  phone: string;
  address: string;
  businessHours: string;
  description: string;
}

export default function StoreSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock 初始数据
  const initialData: StoreInfo = {
    name: "爱尚宠物店",
    phone: "138-8888-8888",
    address: "河北省邯郸市魏县",
    businessHours: "周一至周日 09:00-21:00",
    description: "专业的宠物服务，为您的爱宠提供最优质的照顾。",
  };

  const handleSave = async (values: StoreInfo) => {
    setLoading(true);
    try {
      // TODO: 调用API保存数据
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("保存成功");
      setIsEditing(false);
    } catch (error) {
      message.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(initialData);
    setIsEditing(false);
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* 信息预览卡片 */}
      {!isEditing && (
        <Card title="门店信息" style={{ marginTop: 24 }} bordered={false}>
          <Row gutter={[16, 24]}>
            <Col span={24}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <ShopOutlined
                  style={{ fontSize: 24, color: "#1890ff", marginRight: 16 }}
                />
                <div>
                  <div style={{ color: "#666", fontSize: 14 }}>门店名称</div>
                  <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>
                    爱宠宠物店
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
                    138-8888-8888
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
                    周一至周日 09:00-21:00
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
                    河北省邯郸市魏县某某街道123号
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
                  专业的宠物服务，为您的爱宠提供最优质的照顾。
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}
