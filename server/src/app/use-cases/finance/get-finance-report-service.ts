import { Injectable } from '@nestjs/common';
import { FinanceRecordRepository } from '@app/repositories/finance-record-repository';
import { FinanceType } from '@app/entities/finance-record';

export interface CategoryTotal {
  category: string;
  total: number; // In yuan
}

export interface ReportPeriod {
  period: string; // Date string based on groupBy
  income: number; // In yuan
  expense: number; // In yuan
  profit: number; // In yuan
  incomeByCategory: CategoryTotal[];
  expenseByCategory: CategoryTotal[];
}

export interface FinanceReport {
  periods: ReportPeriod[];
  totalIncome: number; // In yuan
  totalExpense: number; // In yuan
  totalProfit: number; // In yuan
  profitMargin: number; // Percentage
}

export interface GetFinanceReportRequest {
  startDate: Date;
  endDate: Date;
  groupBy: 'daily' | 'monthly' | 'yearly';
  category?: string;
}

@Injectable()
export class GetFinanceReportService {
  constructor(private financeRecordRepository: FinanceRecordRepository) {}

  async execute(request: GetFinanceReportRequest): Promise<FinanceReport> {
    const { startDate, endDate, groupBy, category } = request;

    // Get all records in the date range
    const records = await this.financeRecordRepository.findByDateRange(
      startDate,
      endDate,
      undefined,
      category,
    );

    // Group records by period
    const periods = this.groupByPeriod(records, groupBy, startDate, endDate);

    // Calculate totals
    const totalIncome = this.calculateTotal(records, FinanceType.INCOME);
    const totalExpense = this.calculateTotal(records, FinanceType.EXPENSE);
    const totalProfit = totalIncome - totalExpense;
    const profitMargin =
      totalIncome > 0 ? (totalProfit / totalIncome) * 100 : 0;

    return {
      periods,
      totalIncome,
      totalExpense,
      totalProfit,
      profitMargin,
    };
  }

  private groupByPeriod(
    records: any[],
    groupBy: 'daily' | 'monthly' | 'yearly',
    startDate: Date,
    endDate: Date,
  ): ReportPeriod[] {
    const periods: ReportPeriod[] = [];
    const periodMap = new Map<string, any[]>();

    // Group records by period
    records.forEach((record) => {
      const period = this.getPeriodKey(new Date(record.date), groupBy);
      if (!periodMap.has(period)) {
        periodMap.set(period, []);
      }
      periodMap.get(period)!.push(record);
    });

    // Generate all periods in range
    const allPeriods = this.generatePeriods(startDate, endDate, groupBy);

    allPeriods.forEach((period) => {
      const periodRecords = periodMap.get(period) || [];
      const income = this.calculateTotal(periodRecords, FinanceType.INCOME);
      const expense = this.calculateTotal(periodRecords, FinanceType.EXPENSE);
      const profit = income - expense;

      const incomeByCategory = this.groupByCategory(
        periodRecords,
        FinanceType.INCOME,
      );
      const expenseByCategory = this.groupByCategory(
        periodRecords,
        FinanceType.EXPENSE,
      );

      periods.push({
        period,
        income,
        expense,
        profit,
        incomeByCategory,
        expenseByCategory,
      });
    });

    return periods;
  }

  private getPeriodKey(
    date: Date,
    groupBy: 'daily' | 'monthly' | 'yearly',
  ): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (groupBy) {
      case 'daily':
        return `${year}-${month}-${day}`;
      case 'monthly':
        return `${year}-${month}`;
      case 'yearly':
        return `${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  private generatePeriods(
    startDate: Date,
    endDate: Date,
    groupBy: 'daily' | 'monthly' | 'yearly',
  ): string[] {
    const periods: string[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      periods.push(this.getPeriodKey(current, groupBy));

      switch (groupBy) {
        case 'daily':
          current.setDate(current.getDate() + 1);
          break;
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'yearly':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }

    return [...new Set(periods)]; // Remove duplicates
  }

  private calculateTotal(records: any[], type: FinanceType): number {
    const total = records
      .filter((r) => r.type === type)
      .reduce((sum, r) => sum + r.amount, 0);
    return total / 100; // Convert cents to yuan
  }

  private groupByCategory(records: any[], type: FinanceType): CategoryTotal[] {
    const categoryMap = new Map<string, number>();

    records
      .filter((r) => r.type === type)
      .forEach((record) => {
        const current = categoryMap.get(record.category) || 0;
        categoryMap.set(record.category, current + record.amount);
      });

    return Array.from(categoryMap.entries()).map(([category, total]) => ({
      category,
      total: total / 100, // Convert cents to yuan
    }));
  }
}
