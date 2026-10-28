import { Injectable } from '@nestjs/common';
import { ProductOrderRepository } from '@app/repositories/product-order-repository';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { ProductOrderStatus } from '@app/entities/product-order';
import { AppointmentStatus } from '@app/entities/appointment';

export interface RevenueTrendPoint {
  date: string; // YYYY-MM-DD
  productRevenue: number; // 商品收入（元）
  serviceRevenue: number; // 服务收入（元）
  totalRevenue: number; // 总收入（元）
}

export interface RevenueStatistics {
  totalRevenue: number; // 总收入（元）
  productRevenue: number; // 商品收入（元）
  serviceRevenue: number; // 服务收入（元）
  totalOrders: number; // 总订单数（商品订单 + 服务订单）
  productOrders: number; // 商品订单数
  serviceOrders: number; // 服务订单数
  revenueTrend: RevenueTrendPoint[]; // 收入趋势
}

export interface GetRevenueStatisticsRequest {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class GetRevenueStatisticsService {
  constructor(
    private productOrderRepository: ProductOrderRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute(
    request: GetRevenueStatisticsRequest,
  ): Promise<RevenueStatistics> {
    const { startDate, endDate } = request;

    // 获取商品订单（只统计已完成的）
    const { orders: productOrders } =
      await this.productOrderRepository.findMany(
        {
          status: ProductOrderStatus.COMPLETED,
          startDate,
          endDate,
        },
        undefined,
        undefined,
      );

    // 获取服务订单（只统计已完成的预约）
    const { data: serviceOrders } =
      await this.appointmentRepository.findManyPaginated({
        status: AppointmentStatus.COMPLETED,
        startDate,
        endDate,
        page: 1,
        pageSize: 10000, // 获取所有数据
      });

    // 计算商品收入
    let productRevenue = 0;
    productOrders.forEach((order) => {
      productRevenue += order.totalAmount;
    });

    // 计算服务收入
    let serviceRevenue = 0;
    serviceOrders.forEach((appointment: any) => {
      if (appointment.service) {
        serviceRevenue += appointment.service.value;
      }
    });

    const totalRevenue = productRevenue + serviceRevenue;
    const totalOrders = productOrders.length + serviceOrders.length;

    // 计算收入趋势
    const revenueTrend = this.calculateRevenueTrend(
      productOrders,
      serviceOrders,
      startDate,
      endDate,
    );

    return {
      totalRevenue: totalRevenue / 100, // 转换为元
      productRevenue: productRevenue / 100, // 转换为元
      serviceRevenue: serviceRevenue / 100, // 转换为元
      totalOrders,
      productOrders: productOrders.length,
      serviceOrders: serviceOrders.length,
      revenueTrend,
    };
  }

  private calculateRevenueTrend(
    productOrders: any[],
    serviceOrders: any[],
    startDate: Date,
    endDate: Date,
  ): RevenueTrendPoint[] {
    const trendData: RevenueTrendPoint[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayStart = new Date(current);
      const dayEnd = new Date(current);
      dayEnd.setDate(dayEnd.getDate() + 1);

      // 筛选当天的商品订单
      const dayProductOrders = productOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate < dayEnd;
      });

      // 筛选当天的服务订单
      const dayServiceOrders = serviceOrders.filter((appointment: any) => {
        const appointmentDate = new Date(appointment.appointmentTime);
        return appointmentDate >= dayStart && appointmentDate < dayEnd;
      });

      // 计算当天商品收入
      let dayProductRevenue = 0;
      dayProductOrders.forEach((order) => {
        dayProductRevenue += order.totalAmount;
      });

      // 计算当天服务收入
      let dayServiceRevenue = 0;
      dayServiceOrders.forEach((appointment: any) => {
        if (appointment.service) {
          dayServiceRevenue += appointment.service.value;
        }
      });

      trendData.push({
        date: this.formatDate(current),
        productRevenue: dayProductRevenue / 100, // 转换为元
        serviceRevenue: dayServiceRevenue / 100, // 转换为元
        totalRevenue: (dayProductRevenue + dayServiceRevenue) / 100, // 转换为元
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
