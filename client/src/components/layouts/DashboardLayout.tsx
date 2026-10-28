"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Spin } from "antd";
import type { MenuProps } from "antd";
import {
  HomeOutlined,
  ShoppingOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  ProfileOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  ShopOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeSwitch } from "./ThemeSwitch";
import { useSessionStore } from "@/stores/session";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// 菜单项配置
const menuItems: MenuProps["items"] = [
  {
    key: "/dashboard",
    icon: <HomeOutlined />,
    label: <Link href="/dashboard">首页</Link>,
  },
  {
    key: "products",
    icon: <ShoppingOutlined />,
    label: "商品管理",
    children: [
      {
        key: "/dashboard/products",
        icon: <AppstoreOutlined />,
        label: <Link href="/dashboard/products">商品列表</Link>,
      },
      {
        key: "/dashboard/products/categories",
        icon: <FileTextOutlined />,
        label: <Link href="/dashboard/products/categories">商品分类</Link>,
      },
    ],
  },
  {
    key: "customers",
    icon: <UserOutlined />,
    label: "客户管理",
    children: [
      {
        key: "/dashboard/customers",
        icon: <TeamOutlined />,
        label: <Link href="/dashboard/customers">客户列表</Link>,
      },
    ],
  },
  {
    key: "services",
    icon: <CustomerServiceOutlined />,
    label: "服务管理",
    children: [
      {
        key: "/dashboard/services",
        icon: <AppstoreOutlined />,
        label: <Link href="/dashboard/services">服务项目</Link>,
      },
      {
        key: "/dashboard/appointments",
        icon: <CalendarOutlined />,
        label: <Link href="/dashboard/appointments">服务订单</Link>,
      },
    ],
  },
  {
    key: "orders",
    icon: <ShoppingCartOutlined />,
    label: "订单管理",
    children: [
      {
        key: "/dashboard/orders",
        icon: <ProfileOutlined />,
        label: <Link href="/dashboard/orders">商品订单</Link>,
      },
      {
        key: "/dashboard/cashier",
        icon: <CreditCardOutlined />,
        label: <Link href="/dashboard/cashier">收银台</Link>,
      },
    ],
  },
  {
    key: "/dashboard/inventory",
    icon: <InboxOutlined />,
    label: <Link href="/dashboard/inventory">库存管理</Link>,
  },
  {
    key: "finance",
    icon: <DollarOutlined />,
    label: "财务统计",
    children: [
      {
        key: "/dashboard/finance/revenue",
        icon: <BarChartOutlined />,
        label: <Link href="/dashboard/finance/revenue">收入统计</Link>,
      },
      {
        key: "/dashboard/finance/sales",
        icon: <BarChartOutlined />,
        label: <Link href="/dashboard/finance/sales">商品销量</Link>,
      },
    ],
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "系统设置",
    children: [
      {
        key: "/dashboard/settings/store",
        icon: <ShopOutlined />,
        label: <Link href="/dashboard/settings/store">门店信息</Link>,
      },
      {
        key: "/dashboard/settings/payment",
        icon: <CreditCardOutlined />,
        label: <Link href="/dashboard/settings/payment">支付设置</Link>,
      },
      {
        key: "/dashboard/settings/sms",
        icon: <MessageOutlined />,
        label: <Link href="/dashboard/settings/sms">短信设置</Link>,
      },
      {
        key: "/dashboard/about",
        icon: <InfoCircleOutlined />,
        label: <Link href="/dashboard/about">关于系统</Link>,
      },
    ],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, signOutUser] = useSessionStore((state) => [
    state.user,
    state.signOut,
  ]);

  // 监听路由变化，显示加载状态
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // 处理菜单点击，显示加载状态
  const handleMenuClick = (e: any) => {
    if (e.key !== pathname) {
      setIsNavigating(true);
    }
  };

  // 获取当前选中的菜单项和展开的子菜单
  const getSelectedKeys = () => {
    if (pathname === "/dashboard") return ["/dashboard"];

    // 遍历所有菜单项，包括子菜单
    for (const item of menuItems || []) {
      if (item && "children" in item && item.children) {
        for (const child of item.children) {
          if (
            child &&
            "key" in child &&
            pathname?.startsWith(child.key as string)
          ) {
            return [child.key as string];
          }
        }
      } else if (
        item &&
        "key" in item &&
        pathname?.startsWith(item.key as string)
      ) {
        return [item.key as string];
      }
    }
    return ["/dashboard"];
  };

  // 获取需要展开的子菜单
  const getOpenKeys = () => {
    for (const item of menuItems || []) {
      if (item && "children" in item && item.children) {
        for (const child of item.children) {
          if (
            child &&
            "key" in child &&
            pathname?.startsWith(child.key as string)
          ) {
            return [item.key as string];
          }
        }
      }
    }
    return [];
  };

  const [openKeys, setOpenKeys] = useState<string[]>(getOpenKeys());
  const selectedKeys = getSelectedKeys();

  const handleSignOut = () => {
    signOutUser();
    router.push("/login");
  };

  // 用户下拉菜单
  const userMenuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div style={{ padding: "8px 0" }}>
          <Text strong>{user?.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email}
          </Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: handleSignOut,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 侧边栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={80}
        width={220}
        style={{
          overflow: "hidden",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 1000,
        }}
      >
        {/* Logo 区域 */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: collapsed ? 24 : 20,
            fontWeight: "bold",
            padding: "0 16px",
            flexShrink: 0,
          }}
        >
          {collapsed ? "🐾" : "🐾 爱尚宠物"}
        </div>

        {/* 菜单容器 - 可滚动 */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={handleMenuClick}
            items={menuItems}
            style={{ borderRight: 0, height: "100%" }}
          />
        </div>
      </Sider>

      {/* 主内容区 */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 220,
          transition: "margin-left 0.2s",
        }}
      >
        {/* 顶部导航栏 */}
        <Header
          style={{
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 999,
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* 左侧：折叠按钮 */}
          <div>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                style: { fontSize: 18, cursor: "pointer" },
                onClick: () => setCollapsed(!collapsed),
              },
            )}
          </div>

          {/* 右侧：主题切换 + 用户信息 */}
          <Space size="large">
            <ThemeSwitch />

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} />
                <Text>{user?.name}</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区 */}
        <Content
          style={{
            margin: "0px",
            minHeight: "calc(100vh - 112px)",
            position: "relative",
          }}
        >
          {isNavigating && (
            <div
              style={{
                position: "fixed",
                top: 64,
                left: collapsed ? 80 : 220,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(4px)",
                zIndex: 1000,
                transition: "left 0.2s",
              }}
            >
              <Spin
                size="large"
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 48, color: "#1890ff" }}
                    spin
                  />
                }
              />
              <div style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
                加载中...
              </div>
            </div>
          )}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
