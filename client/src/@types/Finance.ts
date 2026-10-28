export enum FinanceType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export type FinanceRecord = {
  id: string;
  type: FinanceType;
  category: string;
  amount: number; // In cents
  amountYuan: number; // In yuan
  description: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TrendDataPoint = {
  date: string; // YYYY-MM-DD
  income: number; // In yuan
  expense: number; // In yuan
  profit: number; // In yuan
};

export type FinanceStatistics = {
  todayIncome: number; // In yuan
  todayExpense: number; // In yuan
  todayProfit: number; // In yuan
  monthIncome: number; // In yuan
  monthExpense: number; // In yuan
  monthProfit: number; // In yuan
  profitMargin: number; // Percentage
  trendData: TrendDataPoint[]; // Last 7 days
};

export type CategoryTotal = {
  category: string;
  total: number; // In yuan
};

export type ReportPeriod = {
  period: string; // Date string based on groupBy
  income: number; // In yuan
  expense: number; // In yuan
  profit: number; // In yuan
  incomeByCategory: CategoryTotal[];
  expenseByCategory: CategoryTotal[];
};

export type FinanceReport = {
  periods: ReportPeriod[];
  totalIncome: number; // In yuan
  totalExpense: number; // In yuan
  totalProfit: number; // In yuan
  profitMargin: number; // Percentage
};

export type FinanceReportQuery = {
  startDate: string;
  endDate: string;
  groupBy: "daily" | "monthly" | "yearly";
  category?: string;
};
