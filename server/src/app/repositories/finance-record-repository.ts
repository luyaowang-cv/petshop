import { FinanceRecord, FinanceType } from '../entities/finance-record';

export interface FindAllFinanceRecordsParams {
  page?: number;
  pageSize?: number;
  type?: FinanceType;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedFinanceRecords {
  data: FinanceRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export abstract class FinanceRecordRepository {
  abstract create(record: FinanceRecord): Promise<FinanceRecord>;
  abstract findAll(
    params: FindAllFinanceRecordsParams,
  ): Promise<PaginatedFinanceRecords>;
  abstract findById(id: string): Promise<FinanceRecord | null>;
  abstract update(record: FinanceRecord): Promise<FinanceRecord>;
  abstract delete(id: string): Promise<void>;
  abstract findByDateRange(
    startDate: Date,
    endDate: Date,
    type?: FinanceType,
    category?: string,
  ): Promise<FinanceRecord[]>;
}
