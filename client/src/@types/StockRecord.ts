export enum StockInType {
  PURCHASE = "PURCHASE", // 采购入库
  ADJUSTMENT = "ADJUSTMENT", // 库存调整
}

export interface StockRecord {
  id: string;
  productId: string;
  quantity: number;
  type: StockInType;
  cost: number; // 分
  totalCost: number; // 分
  supplier?: string | null;
  operator: string;
  note?: string | null;
  createdAt: string;
}

export interface StockRecordListParams {
  page?: number;
  pageSize?: number;
  productId?: string;
  type?: StockInType;
  startDate?: string;
  endDate?: string;
}

export interface StockRecordListResponse {
  data: StockRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateStockRecordDTO {
  productId: string;
  quantity: number;
  type: StockInType;
  cost?: number; // 分，可选
  supplier?: string;
  operator: string;
  note?: string;
}
