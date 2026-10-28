import { Injectable } from '@nestjs/common';
import { ProductOrderRepository } from '@app/repositories/product-order-repository';
import { ProductRepository } from '@app/repositories/product-repository';
import { ProductOrderStatus } from '@app/entities/product-order';

export interface ProductSalesItem {
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number; // 总销量
  totalRevenue: number; // 总收入（元）
  orderCount: number; // 订单数
  stock: number; // 当前库存
}

export interface SalesTrendPoint {
  date: string; // YYYY-MM-DD
  quantity: number; // 销量
  revenue: number; // 收入（元）
  orderCount: number; // 订单数
}

export interface ProductSalesStatistics {
  topProducts: ProductSalesItem[]; // 销量前10的商品
  allProducts: ProductSalesItem[]; // 所有商品销量
  topProduct: { name: string; quantity: number } | null; // 销量TOP商品
  totalRevenue: number; // 总收入（元）
  totalQuantity: number; // 总销量
  totalOrders: number; // 总订单数
  slowMovingCount: number; // 滞销商品数量（销量<=10）
  salesTrend: SalesTrendPoint[]; // 近7天销售趋势
}

export interface GetProductSalesStatisticsRequest {
  startDate?: Date;
  endDate?: Date;
  category?: string;
}

@Injectable()
export class GetProductSalesStatisticsService {
  constructor(
    private productOrderRepository: ProductOrderRepository,
    private productRepository: ProductRepository,
  ) {}

  async execute(
    request: GetProductSalesStatisticsRequest,
  ): Promise<ProductSalesStatistics> {
    const { startDate, endDate, category } = request;

    // 设置默认日期范围（最近30天）
    const now = new Date();
    const defaultEndDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );
    const defaultStartDate = new Date(defaultEndDate);
    defaultStartDate.setDate(defaultStartDate.getDate() - 29);

    const actualStartDate = startDate || defaultStartDate;
    const actualEndDate = endDate || defaultEndDate;

    // 获取订单数据（只统计已完成的订单）
    const { orders } = await this.productOrderRepository.findMany(
      {
        status: ProductOrderStatus.COMPLETED,
        startDate: actualStartDate,
        endDate: actualEndDate,
      },
      undefined,
      undefined,
    );

    // 统计商品销量
    const productSalesMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        category: string;
        totalQuantity: number;
        totalRevenue: number;
        orderCount: number;
        stock: number;
      }
    >();

    let totalRevenue = 0;
    let totalQuantity = 0;

    // 获取所有涉及的商品ID
    const productIds = new Set<string>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        productIds.add(item.productId);
      });
    });

    // 批量获取商品信息（包含库存）
    const products = await Promise.all(
      Array.from(productIds).map((id) => this.productRepository.findById(id)),
    );
    const productMap = new Map(
      products.filter((p) => p !== null).map((p) => [p!.id, p!]),
    );

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId;
        const product = productMap.get(productId);
        const productName = product?.name || item.product?.name || '未知商品';
        const productCategory =
          product?.category || item.product?.category || 'OTHER';
        const productStock = product?.stock || 0;

        // 如果指定了分类，只统计该分类的商品
        if (category && productCategory !== category) {
          return;
        }

        if (!productSalesMap.has(productId)) {
          productSalesMap.set(productId, {
            productId,
            productName,
            category: productCategory,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0,
            stock: productStock,
          });
        }

        const productSales = productSalesMap.get(productId)!;
        productSales.totalQuantity += item.quantity;
        productSales.totalRevenue += item.subtotal;
        productSales.orderCount += 1;

        totalQuantity += item.quantity;
        totalRevenue += item.subtotal;
      });
    });

    // 转换为数组并排序（按销量降序）
    const allProductsList = Array.from(productSalesMap.values()).map(
      (item) => ({
        ...item,
        totalRevenue: item.totalRevenue / 100, // 转换为元
      }),
    );

    const sortedProducts = [...allProductsList].sort(
      (a, b) => b.totalQuantity - a.totalQuantity,
    );

    const topProducts = sortedProducts.slice(0, 10);
    const topProduct =
      sortedProducts.length > 0
        ? {
            name: sortedProducts[0].productName,
            quantity: sortedProducts[0].totalQuantity,
          }
        : null;

    // 统计滞销商品（销量<=10）
    const slowMovingCount = allProductsList.filter(
      (item) => item.totalQuantity <= 10,
    ).length;

    // 计算近7天销售趋势
    const sevenDaysAgo = new Date(actualEndDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const salesTrend = this.calculateSalesTrend(
      orders,
      sevenDaysAgo,
      actualEndDate,
      category,
    );

    return {
      topProducts,
      allProducts: allProductsList,
      topProduct,
      totalRevenue: totalRevenue / 100, // 转换为元
      totalQuantity,
      totalOrders: orders.length,
      slowMovingCount,
      salesTrend,
    };
  }

  private calculateSalesTrend(
    orders: any[],
    startDate: Date,
    endDate: Date,
    category?: string,
  ): SalesTrendPoint[] {
    const trendData: SalesTrendPoint[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayStart = new Date(current);
      const dayEnd = new Date(current);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate < dayEnd;
      });

      let dayQuantity = 0;
      let dayRevenue = 0;

      dayOrders.forEach((order) => {
        order.items.forEach((item: any) => {
          const productCategory = item.product?.category || 'OTHER';

          // 如果指定了分类，只统计该分类的商品
          if (category && productCategory !== category) {
            return;
          }

          dayQuantity += item.quantity;
          dayRevenue += item.subtotal;
        });
      });

      trendData.push({
        date: this.formatDate(current),
        quantity: dayQuantity,
        revenue: dayRevenue / 100, // 转换为元
        orderCount: dayOrders.length,
      });

      current.setDate(current.getDate() + 1);
    }

    return trendData;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
