import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { GetFinanceStatisticsService } from '@app/use-cases/finance/get-finance-statistics-service';
import { GetFinanceReportService } from '@app/use-cases/finance/get-finance-report-service';
import { GetRevenueStatisticsService } from '@app/use-cases/finance/get-revenue-statistics-service';
import { DatabaseModule } from '@infra/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FinanceController],
  providers: [
    GetFinanceStatisticsService,
    GetFinanceReportService,
    GetRevenueStatisticsService,
  ],
})
export class FinanceModule {}
