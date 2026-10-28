"use client";

import React from "react";
import { Card, Space, Typography, Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title } = Typography;

interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface PageContainerProps {
  title: string;
  breadcrumb?: BreadcrumbItem[];
  extra?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
}

export function PageContainer({
  title,
  breadcrumb,
  extra,
  children,
  loading = false,
}: PageContainerProps) {
  // 默认面包屑
  const defaultBreadcrumb: BreadcrumbItem[] = [
    { title: "首页", href: "/dashboard" },
    { title },
  ];

  const breadcrumbItems = breadcrumb || defaultBreadcrumb;

  return (
    <div>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24 }}>
        {/* 面包屑 */}
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item>
              <Link href="/dashboard">
                <HomeOutlined />
              </Link>
            </Breadcrumb.Item>
            {breadcrumbItems.slice(1).map((item, index) => (
              <Breadcrumb.Item key={index}>
                {item.href ? (
                  <Link href={item.href}>{item.title}</Link>
                ) : (
                  item.title
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        )}

        {/* 标题和操作按钮 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          {extra && <Space>{extra}</Space>}
        </div>
      </div>

      {/* 页面内容 */}
      <Card loading={loading} bordered={false}>
        {children}
      </Card>
    </div>
  );
}
