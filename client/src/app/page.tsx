"use client";

import { useEffect } from "react";
import { Button, Card, Space, Typography, Switch } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

const { Title, Paragraph } = Typography;

export default function Home() {
  const { theme, toggleTheme, mounted } = useTheme();

  useEffect(() => {
    // ping the server since we're hosting using RENDER free tier, this will
    // wake up the server as soon as possible
    async function pingServer() {
      console.log("pinging server");

      fetch(process.env.NEXT_PUBLIC_API_URL || "", {
        method: "get",
      })
        .then(() => {
          console.log("ping response");
        })
        .catch(() => {});
    }

    pingServer();
  }, []);

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* 简单的顶部导航 */}
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          🐾 吉宠宠物店后台管理
        </Title>
        <Space>
          {mounted && (
            <Switch
              checked={theme === "dark"}
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
          )}
          <Link href="/login">
            <Button type="primary">登录</Button>
          </Link>
        </Space>
      </header>

      {/* 主内容区 */}
      <section
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 600, textAlign: "center" }}>
          <Title level={1}>🐾 吉宠宠物店后台管理 🐾</Title>


          <Link href="/dashboard">
            <Button type="primary" size="large">
              进入系统
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
