import {
  ProductOrder,
  ProductOrderStatus,
  CreateProductOrderData,
} from "@/@types/ProductOrder";
import api from "../api";

export const PRODUCT_ORDER_KEY = "product-order-fetch";

interface ProductOrdersReturn {
  orders: ProductOrder[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

interface FetchProductOrdersParams {
  customerId?: string;
  status?: ProductOrderStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchProductOrders(params?: FetchProductOrdersParams) {
  const { data } = await api.get<ProductOrdersReturn>("/product-orders", {
    params,
  });
  return data;
}

export async function fetchProductOrder(id: string) {
  const { data } = await api.get<{ order: ProductOrder }>(
    `/product-orders/${id}`,
  );
  return data;
}

export async function createProductOrder(orderData: CreateProductOrderData) {
  const { data } = await api.post<{ order: ProductOrder }>(
    "/product-orders",
    orderData,
  );
  return data;
}

export async function updateProductOrderStatus(
  id: string,
  status: ProductOrderStatus,
) {
  const { data } = await api.patch<{ order: ProductOrder }>(
    `/product-orders/${id}/status`,
    { status },
  );
  return data;
}

// 商品销量统计相关类型和API
export interface ProductSalesItem {
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  stock: number;
}

export interface SalesTrendPoint {
  date: string;
  quantity: number;
  revenue: number;
  orderCount: number;
}

export interface ProductSalesStatistics {
  topProducts: ProductSalesItem[];
  allProducts: ProductSalesItem[];
  topProduct: { name: string; quantity: number } | null;
  totalRevenue: number;
  totalQuantity: number;
  totalOrders: number;
  slowMovingCount: number;
  salesTrend: SalesTrendPoint[];
}

export interface FetchProductSalesParams {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export const PRODUCT_SALES_KEY = "product-sales-statistics";

export async function fetchProductSalesStatistics(
  params?: FetchProductSalesParams,
) {
  const { data } = await api.get<ProductSalesStatistics>(
    "/product-orders/statistics/sales",
    { params },
  );
  return data;
}
