import { Product } from "./Product";

export enum ProductOrderStatus {
  PENDING = "PENDING", // 待处理
  CONFIRMED = "CONFIRMED", // 已确认
  COMPLETED = "COMPLETED", // 已完成
  CANCELED = "CANCELED", // 已取消
}

export type ProductOrderItem = {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
};

export type ProductOrder = {
  id: string;
  customerId?: string; // 可选，支持散客
  totalAmount: number;
  status: ProductOrderStatus;
  note?: string;
  items: ProductOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreateProductOrderData = {
  customerId?: string; // 可选，支持散客
  items: {
    productId: string;
    quantity: number;
  }[];
  note?: string;
  pointsUsed?: number; // 使用的积分数量
  balanceUsed?: number; // 使用的余额（分）
};
