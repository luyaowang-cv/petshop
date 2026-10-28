"use client";

import { useMemo } from "react";
import { Card, Row, Col, Statistic, Tag, Empty, Spin } from "antd";
import {
  ShoppingOutlined,
  InboxOutlined,
  DollarOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useProducts } from "@/services/queries/Product";
import { ProductCategory, ProductStatus, type Product } from "@/@types/Product";
import { PRODUCT } from "@/constants/i18n";
import { centsToYuan } from "@/services/api/product";
import { useRouter } from "next/navigation";

// 分类映射
const categoryMap = {
  [ProductCategory.FOOD]: {
    name: PRODUCT.CATEGORY_FOOD,
    icon: "🍖",
    color: "#52c41a",
  },
  [ProductCategory.SUPPLIES]: {
    name: PRODUCT.CATEGORY_SUPPLIES,
    icon: "🛍️",
    color: "#1890ff",
  },
  [ProductCategory.MEDICINE]: {
    name: PRODUCT.CATEGORY_MEDICINE,
    icon: "💊",
    color: "#f5222d",
  },
  [ProductCategory.TOY]: {
    name: PRODUCT.CATEGORY_TOY,
    icon: "🎾",
    color: "#faad14",
  },
  [ProductCategory.PET]: {
    name: PRODUCT.CATEGORY_PET,
    icon: "🐾",
    color: "#722ed1",
  },
  [ProductCategory.OTHER]: {
    name: PRODUCT.CATEGORY_OTHER,
    icon: "📦",
    color: "#8c8c8c",
  },
};

export default function ProductCategoriesPage() {
  const router = useRouter();

  // 获取所有商品数据（不分页）
  const { data, isLoading } = useProducts({
    page: 1,
    pageSize: 500, // 获取足够多的商品用于统计
  });

  // 调试：打印数据
  console.log("商品数据:", data);
  console.log("加载状态:", isLoading);

  // 计算每个分类的统计数据
  const categoryStats = useMemo(() => {
    // 始终返回所有分类，即使没有商品数据
    const stats = Object.values(ProductCategory).map((category) => {
      const products = data?.data?.filter((p) => p.category === category) || [];
      const activeProducts = products.filter(
        (p) => p.status === ProductStatus.ACTIVE,
      );
      const lowStockProducts = products.filter((p) => p.isLowStock);

      const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
      const totalValue = products.reduce(
        (sum, p) => sum + p.price * p.stock,
        0,
      );
      const totalCost = products.reduce((sum, p) => sum + p.cost * p.stock, 0);

      return {
        category,
        ...categoryMap[category],
        totalProducts: products.length,
        activeProducts: activeProducts.length,
        inactiveProducts: products.length - activeProducts.length,
        lowStockProducts: lowStockProducts.length,
        totalStock,
        totalValue,
        totalCost,
        profit: totalValue - totalCost,
      };
    });

    // 按商品数量排序
    return stats.sort((a, b) => b.totalProducts - a.totalProducts);
  }, [data]);

  // 计算总计
  const totalStats = useMemo(() => {
    if (!categoryStats.length) return null;

    return {
      totalProducts: categoryStats.reduce((sum, s) => sum + s.totalProducts, 0),
      activeProducts: categoryStats.reduce(
        (sum, s) => sum + s.activeProducts,
        0,
      ),
      totalStock: categoryStats.reduce((sum, s) => sum + s.totalStock, 0),
      totalValue: categoryStats.reduce((sum, s) => sum + s.totalValue, 0),
      lowStockProducts: categoryStats.reduce(
        (sum, s) => sum + s.lowStockProducts,
        0,
      ),
    };
  }, [categoryStats]);

  // 点击分类卡片，跳转到商品列表并筛选该分类
  const handleCategoryClick = (category: ProductCategory) => {
    router.push(`/dashboard/products?category=${category}`);
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      {/* 总览卡片 */}
      <Card
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            📊 商品分类统计
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        {totalStats && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="商品总数"
                value={totalStats.totalProducts}
                prefix={<ShoppingOutlined />}
                suffix="个"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="在售商品"
                value={totalStats.activeProducts}
                valueStyle={{ color: "#52c41a" }}
                suffix="个"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="总库存"
                value={totalStats.totalStock}
                prefix={<InboxOutlined />}
                suffix="件"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="库存总价值"
                value={centsToYuan(totalStats.totalValue).toFixed(2)}
                prefix={<DollarOutlined />}
                suffix="元"
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
          </Row>
        )}
      </Card>

      {/* 分类卡片 */}
      <Row gutter={[16, 16]}>
        {categoryStats.map((stat) => (
          <Col xs={24} sm={12} lg={8} key={stat.category}>
            <Card
              hoverable
              onClick={() => handleCategoryClick(stat.category)}
              style={{
                borderLeft: `4px solid ${stat.color}`,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 32, marginRight: 12 }}>
                  {stat.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 600,
                      color: stat.color,
                    }}
                  >
                    {stat.name}
                  </h3>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="blue">{stat.totalProducts} 个商品</Tag>
                    {stat.lowStockProducts > 0 && (
                      <Tag color="orange" icon={<WarningOutlined />}>
                        {stat.lowStockProducts} 个库存不足
                      </Tag>
                    )}
                  </div>
                </div>
              </div>

              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>在售商品</div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#52c41a",
                    }}
                  >
                    {stat.activeProducts}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>已下架</div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#8c8c8c",
                    }}
                  >
                    {stat.inactiveProducts}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>总库存</div>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>
                    {stat.totalStock}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>库存价值</div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#1890ff",
                    }}
                  >
                    ¥{centsToYuan(stat.totalValue).toFixed(0)}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
