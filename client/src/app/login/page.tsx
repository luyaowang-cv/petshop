"use client";

import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  message,
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/services/queries/Session";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { useSessionStore } from "src/stores/session";
import { z } from "zod";
import { USER } from "@/constants/i18n";
import Link from "next/link";

const { Title, Paragraph, Text } = Typography;

const signInSchema = z.object({
  email: z
    .string({
      required_error: USER.ENTER_EMAIL,
    })
    .email({
      message: "请输入有效的邮箱地址",
    }),
  password: z
    .string({
      required_error: USER.ENTER_PASSWORD,
    })
    .min(6, {
      message: "密码至少需要6个字符",
    }),
});

type SignInFormData = z.infer<typeof signInSchema>;

const LOGIN_DEFAULT_USER = {
  email: "admin@email.com",
  password: "123456",
};

export default function Login() {
  const signInUser = useSessionStore((state) => state.signIn);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: LOGIN_DEFAULT_USER.email,
      password: LOGIN_DEFAULT_USER.password,
    },
  });

  const signInMutation = useMutation({
    mutationFn: (payload: SignInFormData) => signIn(payload),
    onSuccess: (data) => {
      signInUser(data.user, data.accessToken, data.refreshToken);
      message.success(USER.LOGIN_SUCCESS);
      router.push("/dashboard");
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 401) {
        message.error(USER.INVALID_CREDENTIALS);
      } else {
        message.error(USER.LOGIN_FAILED);
      }
    },
  });

  function handleSignIn(data: SignInFormData) {
    signInMutation.mutate(data);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "24px",
      }}
    >
      <Card
        style={{
          maxWidth: 900,
          width: "100%",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <Row gutter={[48, 24]} align="middle">
          {/* 左侧：插图和欢迎语 */}
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 80, marginBottom: 16 }}>🐾</div>
                <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
                  吉宠宠物店
                </Title>
                <Paragraph
                  style={{ fontSize: 16, color: "#8c8c8c", marginTop: 8 }}
                >
                  让宠物护理更简单
                </Paragraph>
              </div>

              <div
                style={{
                  background: "#f0f5ff",
                  padding: 24,
                  borderRadius: 12,
                  textAlign: "center",
                }}
              >
                <Space direction="vertical" size="small">
                  <Text strong style={{ fontSize: 16 }}>
                    ✨ 功能特点
                  </Text>
                  <Text type="secondary">📅 预约管理</Text>
                  <Text type="secondary">👥 客户管理</Text>
                  <Text type="secondary">🐶 宠物档案</Text>
                  <Text type="secondary">💼 服务管理</Text>
                </Space>
              </div>
            </Space>
          </Col>

          {/* 右侧：登录表单 */}
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={3} style={{ marginBottom: 8 }}>
                  {USER.LOGIN}
                </Title>
                <Text type="secondary">欢迎回来！请登录您的账户</Text>
              </div>

              <form onSubmit={handleSubmit(handleSignIn)}>
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  {/* 邮箱输入 */}
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Form.Item
                        validateStatus={errors.email ? "error" : ""}
                        help={errors.email?.message}
                        style={{ marginBottom: 0 }}
                      >
                        <Input
                          {...field}
                          size="large"
                          prefix={<MailOutlined style={{ color: "#bfbfbf" }} />}
                          placeholder={USER.ENTER_EMAIL}
                        />
                      </Form.Item>
                    )}
                  />

                  {/* 密码输入 */}
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Form.Item
                        validateStatus={errors.password ? "error" : ""}
                        help={errors.password?.message}
                        style={{ marginBottom: 0 }}
                      >
                        <Input.Password
                          {...field}
                          size="large"
                          prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                          placeholder={USER.ENTER_PASSWORD}
                        />
                      </Form.Item>
                    )}
                  />

                  {/* 登录按钮 */}
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={signInMutation.isLoading}
                    block
                    style={{ height: 48, fontSize: 16, fontWeight: 500 }}
                  >
                    {USER.LOGIN}
                  </Button>

                  {/* 返回首页 */}
                  <div style={{ textAlign: "center" }}>
                    <Link href="/">
                      <Button type="link">← 返回首页</Button>
                    </Link>
                  </div>
                </Space>
              </form>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
