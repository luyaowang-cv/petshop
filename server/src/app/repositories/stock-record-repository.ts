import { StockRecord } from '../entities/stock-record';

export interface StockRecordListParams {
  page?: number;
  pageSize?: number;
  productId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface StockRecordListResponse {
  data: StockRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export abstract class StockRecordRepository {
  abstract create(stockRecord: StockRecord): Promise<void>;
  abstract findById(id: string): Promise<StockRecord | null>;
  abstract list(
    params: StockRecordListParams,
  ): Promise<StockRecordListResponse>;
}
