import { Injectable } from '@nestjs/common';
import { FinanceRecordRepository } from '@app/repositories/finance-record-repository';
import { FinanceType } from '@app/entities/finance-record';

export interface TrendDataPoint {
  date: string; // YYYY-MM-DD
  income: number; // In yuan
  expense: number; // In yuan
  profit: number; // In yuan
}

export interface FinanceStatistics {
  todayIncome: number; // In yuan
  todayExpense: number; // In yuan
  todayProfit: number; // In yuan
  monthIncome: number; // In yuan
  monthExpense: number; // In yuan
  monthProfit: number; // In yuan
  profitMargin: number; // Percentage
  trendData: TrendDataPoint[]; // Last 7 days
}

@Injectable()
export class GetFinanceStatisticsService {
  constructor(private financeRecordRepository: FinanceRecordRepository) {}

  async execute(): Promise<FinanceStatistics> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    // Get today's records
    const todayRecords = await this.financeRecordRepository.findByDateRange(
      todayStart,
      todayEnd,
    );

    // Get this month's records
    const monthRecords = await this.financeRecordRepository.findByDateRange(
      monthStart,
      monthEnd,
    );

    // Get last 7 days records
    const trendRecords = await this.financeRecordRepository.findByDateRange(
      sevenDaysAgo,
      todayEnd,
    );

    // Calculate today's statistics
    const todayIncome = this.calculateTotal(todayRecords, FinanceType.INCOME);
    const todayExpense = this.calculateTotal(todayRecords, FinanceType.EXPENSE);
    const todayProfit = todayIncome - todayExpense;

    // Calculate month's statistics
    const monthIncome = this.calculateTotal(monthRecords, FinanceType.INCOME);
    const monthExpense = this.calculateTotal(monthRecords, FinanceType.EXPENSE);
    const monthProfit = monthIncome - monthExpense;

    // Calculate profit margin
    const profitMargin =
      monthIncome > 0 ? (monthProfit / monthIncome) * 100 : 0;

    // Calculate trend data
    const trendData = this.calculateTrendData(
      trendRecords,
      sevenDaysAgo,
      todayStart,
    );

    return {
      todayIncome,
      todayExpense,
      todayProfit,
      monthIncome,
      monthExpense,
      monthProfit,
      profitMargin,
      trendData,
    };
  }

  private calculateTotal(records: any[], type: FinanceType): number {
    const total = records
      .filter((r) => r.type === type)
      .reduce((sum, r) => sum + r.amount, 0);
    return total / 100; // Convert cents to yuan
  }

  private calculateTrendData(
    records: any[],
    startDate: Date,
    endDate: Date,
  ): TrendDataPoint[] {
    const trendData: TrendDataPoint[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayStart = new Date(current);
      const dayEnd = new Date(current);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayRecords = records.filter((r) => {
        const recordDate = new Date(r.date);
        return recordDate >= dayStart && recordDate < dayEnd;
      });

      const income = this.calculateTotal(dayRecords, FinanceType.INCOME);
      const expense = this.calculateTotal(dayRecords, FinanceType.EXPENSE);
      const profit = income - expense;

      trendData.push({
        date: this.formatDate(current),
        income,
        expense,
        profit,
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
