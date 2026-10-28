"use client";

import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Divider,
  Statistic,
} from "antd";
import {
  GithubOutlined,
  CodeOutlined,
  DatabaseOutlined,
  ApiOutlined,
  UserOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  DollarOutlined,
  MessageOutlined,
  CrownOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function AboutPage() {
  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* 系统介绍 */}
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>🐾</div>
            <Title level={2} style={{ marginBottom: 8 }}>
              爱尚宠物管理系统
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              现代化的宠物店一体化管理解决方案
            </Text>
          </div>

          <Divider />

          <Paragraph
            style={{ fontSize: 15, textAlign: "center", marginBottom: 0 }}
          >
            本系统采用前后端分离架构，使用最新技术栈构建，为宠物店提供客户管理、服务预约、
            商品销售、库存管理、财务统计等全方位功能，助力宠物店数字化转型。
          </Paragraph>
        </Card>

        {/* 核心功能模块 */}
        <Card title="✨ 核心功能模块">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ height: "100%" }}>
                <Space direction="vertical" size="small">
                  <UserOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                  <Title level={5}>客户管理</Title>
                  <Text type="secondary">
                    客户信息、会员等级、积分余额、宠物档案一体化管理
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ height: "100%" }}>
                <Space direction="vertical" size="small">
                  <CalendarOutlined
                    style={{ fontSize: 32, color: "#1890ff" }}
                  />
                  <Title level={5}>服务预约</Title>
                  <Text type="secondary">
                    在线预约、服务订单、状态跟踪、自动提醒
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ height: "100%" }}>
                <Space direction="vertical" size="small">
                  <ShoppingOutlined
                    style={{ fontSize: 32, color: "#722ed1" }}
                  />
                  <Title level={5}>商品管理</Title>
                  <Text type="secondary">
                    商品信息、分类管理、库存预警、销售统计
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ height: "100%" }}>
                <Space direction="vertical" size="small">
                  <DollarOutlined style={{ fontSize: 32, color: "#faad14" }} />
                  <Title level={5}>财务统计</Title>
                  <Text type="secondary">
                    收入统计、利润分析、商品销量、数据报表
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ height: "100%" }}>
                <Space direction="vertical" size="small">
                  <MessageOutlined style={{ fontSize: 32, color: "#13c2c2" }} />
                  <Title level={5}>短信通知</Title>
                  <Text type="secondary">
                    服务完成通知、预约提醒、支持三大云服务商
                  </Text>
                </Space>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <Card size="small" style={{ height: "100%" }}>
                <Space direction="vertical" size="small">
                  <CrownOutlined style={{ fontSize: 32, color: "#eb2f96" }} />
                  <Title level={5}>会员系统</Title>
                  <Text type="secondary">
                    会员等级、积分管理、余额充值、消费记录
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 技术栈 */}
        <Card title="🛠️ 技术架构">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card
                type="inner"
                title={
                  <>
                    <CodeOutlined /> 前端技术
                  </>
                }
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>框架：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">Next.js 13</Tag>
                      <Tag color="blue">React 18</Tag>
                      <Tag color="blue">TypeScript</Tag>
                    </div>
                  </div>
                  <div>
                    <Text strong>UI 组件：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="cyan">Ant Design 5</Tag>
                      <Tag color="cyan">Tailwind CSS</Tag>
                    </div>
                  </div>
                  <div>
                    <Text strong>状态管理：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag>Zustand</Tag>
                      <Tag>React Query</Tag>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                type="inner"
                title={
                  <>
                    <ApiOutlined /> 后端技术
                  </>
                }
              >
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>框架：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="green">NestJS</Tag>
                      <Tag color="green">Node.js</Tag>
                      <Tag color="green">TypeScript</Tag>
                    </div>
                  </div>
                  <div>
                    <Text strong>数据库：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag color="purple">MySQL</Tag>
                      <Tag color="purple">Prisma ORM</Tag>
                    </div>
                  </div>
                  <div>
                    <Text strong>认证：</Text>
                    <div style={{ marginTop: 8 }}>
                      <Tag>JWT</Tag>
                      <Tag>Passport.js</Tag>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 系统特性 */}
        <Card title="🎯 系统特性">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="响应式设计"
                value="100"
                suffix="%"
                valueStyle={{ color: "#3f8600" }}
              />
              <Text type="secondary">支持电脑、平板、手机多端访问</Text>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="深色模式"
                value="支持"
                valueStyle={{ color: "#1890ff" }}
              />
              <Text type="secondary">明暗主题自由切换</Text>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="数据安全"
                value="JWT"
                valueStyle={{ color: "#722ed1" }}
              />
              <Text type="secondary">安全的用户认证和授权</Text>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Statistic
                title="实时同步"
                value="自动"
                valueStyle={{ color: "#13c2c2" }}
              />
              <Text type="secondary">数据实时更新无需刷新</Text>
            </Col>
          </Row>
        </Card>

        {/* 版本信息 */}
        <Card title="📦 版本信息">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Space direction="vertical" size="small">
                <Text strong>当前版本：</Text>
                <Tag color="blue" style={{ fontSize: 14 }}>
                  v1.0.0
                </Tag>
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space direction="vertical" size="small">
                <Text strong>最后更新：</Text>
                <Text>2026年2月25日</Text>
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space direction="vertical" size="small">
                <Text strong>许可证：</Text>
                <Tag>MIT License</Tag>
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space direction="vertical" size="small">
                <Text strong>源代码：</Text>
                <a
                  href="https://github.com/luyaowang-cv/petshop-management-system"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubOutlined /> GitHub
                </a>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 致谢 */}
        <Card>
          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: 15 }}>
              感谢所有为本项目做出贡献的开发者 ❤️
            </Text>
            <br />
            <Text type="secondary">
              如有问题或建议，欢迎在 GitHub 提交 Issue
            </Text>
          </div>
        </Card>
      </Space>
    </div>
  );
}
