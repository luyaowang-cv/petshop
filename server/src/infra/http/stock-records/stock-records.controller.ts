import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateStockRecordService } from 'src/app/use-cases/stock-record/create-stock-record-service';
import { ListStockRecordsService } from 'src/app/use-cases/stock-record/list-stock-records-service';
import { CreateStockRecordBody } from './dtos/create-stock-record-body';
import { ListStockRecordsQuery } from './dtos/list-stock-records-query';
import { StockRecordViewModel } from '../view-models/stock-record-view-model';

@Controller('stock-records')
export class StockRecordsController {
  constructor(
    private createStockRecordService: CreateStockRecordService,
    private listStockRecordsService: ListStockRecordsService,
  ) {}

  @Post()
  async create(@Body() body: CreateStockRecordBody) {
    const { stockRecord } = await this.createStockRecordService.execute(body);

    return {
      stockRecord: StockRecordViewModel.toHTTP(stockRecord),
    };
  }

  @Get()
  async list(@Query() query: ListStockRecordsQuery) {
    const { page, pageSize, productId, startDate, endDate } = query;

    const result = await this.listStockRecordsService.execute({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      productId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return {
      data: result.data.map(StockRecordViewModel.toHTTP),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
