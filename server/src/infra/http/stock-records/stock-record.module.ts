import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { CreateStockRecordService } from 'src/app/use-cases/stock-record/create-stock-record-service';
import { ListStockRecordsService } from 'src/app/use-cases/stock-record/list-stock-records-service';
import { StockRecordsController } from './stock-records.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [StockRecordsController],
  providers: [CreateStockRecordService, ListStockRecordsService],
})
export class StockRecordModule {}
