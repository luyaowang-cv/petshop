import { Injectable } from '@nestjs/common';
import { StockRecord } from 'src/app/entities/stock-record';
import {
  StockRecordRepository,
  StockRecordListParams,
  StockRecordListResponse,
} from 'src/app/repositories/stock-record-repository';

@Injectable()
export class ListStockRecordsService {
  constructor(private stockRecordRepository: StockRecordRepository) {}

  async execute(
    params: StockRecordListParams,
  ): Promise<StockRecordListResponse> {
    return await this.stockRecordRepository.list(params);
  }
}
