import api from "../api";
import {
  FinanceStatistics,
  FinanceReport,
  FinanceReportQuery,
} from "@/@types/Finance";

export const FINANCE_STATISTICS_KEY = "finance-statistics";
export const FINANCE_REPORT_KEY = "finance-report";

export async function fetchFinanceStatistics(): Promise<FinanceStatistics> {
  const { data } = await api.get<FinanceStatistics>("/finance/statistics");
  return data;
}

export async function fetchFinanceReport(
  query: FinanceReportQuery,
): Promise<FinanceReport> {
  const { data } = await api.get<FinanceReport>("/finance/reports", {
    params: query,
  });
  return data;
}

// 收入统计相关类型和API
export interface RevenueTrendPoint {
  date: string;
  productRevenue: number;
  serviceRevenue: number;
  totalRevenue: number;
}

export interface RevenueStatistics {
  totalRevenue: number;
  productRevenue: number;
  serviceRevenue: number;
  totalOrders: number;
  productOrders: number;
  serviceOrders: number;
  revenueTrend: RevenueTrendPoint[];
}

export interface FetchRevenueStatisticsParams {
  startDate?: string;
  endDate?: string;
}

export const REVENUE_STATISTICS_KEY = "revenue-statistics";

export async function fetchRevenueStatistics(
  params?: FetchRevenueStatisticsParams,
): Promise<RevenueStatistics> {
  const { data } = await api.get<RevenueStatistics>(
    "/finance/revenue/statistics",
    { params },
  );
  return data;
}
