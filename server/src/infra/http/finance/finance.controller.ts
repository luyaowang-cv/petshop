import { Controller, Get, Query } from '@nestjs/common';
import { GetFinanceStatisticsService } from '@app/use-cases/finance/get-finance-statistics-service';
import { GetFinanceReportService } from '@app/use-cases/finance/get-finance-report-service';
import { GetRevenueStatisticsService } from '@app/use-cases/finance/get-revenue-statistics-service';
import { FinanceReportQuery } from './dtos/finance-report-query';
import { RevenueStatisticsQuery } from './dtos/revenue-statistics-query';

@Controller('finance')
export class FinanceController {
  constructor(
    private getFinanceStatisticsService: GetFinanceStatisticsService,
    private getFinanceReportService: GetFinanceReportService,
    private getRevenueStatisticsService: GetRevenueStatisticsService,
  ) {}

  @Get('statistics')
  async getStatistics() {
    return await this.getFinanceStatisticsService.execute();
  }

  @Get('reports')
  async getReports(@Query() query: FinanceReportQuery) {
    return await this.getFinanceReportService.execute({
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
      groupBy: query.groupBy,
      category: query.category,
    });
  }

  @Get('revenue/statistics')
  async getRevenueStatistics(@Query() query: RevenueStatisticsQuery) {
    // 设置默认日期范围
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
    defaultStartDate.setDate(defaultStartDate.getDate() - 6); // 默认最近7天

    // 纯日期字符串（如 "2026-10-28"）会被 new Date() 解析成当天 00:00:00，
    // 导致 endDate 当天稍晚完成的预约（如 10:00）被 `appointmentTime <= endDate` 排除。
    // 这里把 start/end 分别补到当天 00:00:00 / 23:59:59（本地时区，与默认值保持一致）。
    const startDate = query.startDate
      ? new Date(`${query.startDate}T00:00:00`)
      : defaultStartDate;
    const endDate = query.endDate
      ? new Date(`${query.endDate}T23:59:59`)
      : defaultEndDate;

    return await this.getRevenueStatisticsService.execute({
      startDate,
      endDate,
    });
  }
}
