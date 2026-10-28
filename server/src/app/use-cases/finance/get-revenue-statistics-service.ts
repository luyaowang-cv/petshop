import { Injectable } from '@nestjs/common';
import { FinanceRecordRepository } from '@app/repositories/finance-record-repository';
import { FinanceType } from '@app/entities/finance-record';

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

const SERVICE_INCOME_CATEGORY = '服务收入';
const PRODUCT_INCOME_CATEGORY = '商品销售';

@Injectable()
export class GetRevenueStatisticsService {
  constructor(private financeRecordRepository: FinanceRecordRepository) {}

  async execute(
    request: GetRevenueStatisticsRequest,
  ): Promise<RevenueStatistics> {
    const { startDate, endDate } = request;

    // 收入以“完成/收款时间”落库在 FinanceRecord，直接按日期范围统计，
    // 避免用预约时间(appointmentTime)导致刚完成的服务被归到错误日期而不入账。
    const records = await this.financeRecordRepository.findByDateRange(
      startDate,
      endDate,
      FinanceType.INCOME,
    );

    const serviceRecords = records.filter(
      (r) => r.category === SERVICE_INCOME_CATEGORY,
    );
    const productRecords = records.filter(
      (r) => r.category === PRODUCT_INCOME_CATEGORY,
    );

    const serviceRevenue = this.sumAmount(serviceRecords);
    const productRevenue = this.sumAmount(productRecords);
    const totalRevenue = serviceRevenue + productRevenue;

    return {
      totalRevenue: totalRevenue / 100, // 转换为元
      productRevenue: productRevenue / 100,
      serviceRevenue: serviceRevenue / 100,
      totalOrders: serviceRecords.length + productRecords.length,
      productOrders: productRecords.length,
      serviceOrders: serviceRecords.length,
      revenueTrend: this.calculateRevenueTrend(records, startDate, endDate),
    };
  }

  private sumAmount(records: { amount: number }[]): number {
    return records.reduce((sum, r) => sum + r.amount, 0);
  }

  private calculateRevenueTrend(
    records: { amount: number; category: string; date: Date }[],
    startDate: Date,
    endDate: Date,
  ): RevenueTrendPoint[] {
    const trendData: RevenueTrendPoint[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayStart = new Date(current);
      const dayEnd = new Date(current);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayRecords = records.filter((r) => {
        const recordDate = new Date(r.date);
        return recordDate >= dayStart && recordDate < dayEnd;
      });

      const dayServiceRevenue = this.sumAmount(
        dayRecords.filter((r) => r.category === SERVICE_INCOME_CATEGORY),
      );
      const dayProductRevenue = this.sumAmount(
        dayRecords.filter((r) => r.category === PRODUCT_INCOME_CATEGORY),
      );

      trendData.push({
        date: this.formatDate(current),
        productRevenue: dayProductRevenue / 100,
        serviceRevenue: dayServiceRevenue / 100,
        totalRevenue: (dayProductRevenue + dayServiceRevenue) / 100,
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
