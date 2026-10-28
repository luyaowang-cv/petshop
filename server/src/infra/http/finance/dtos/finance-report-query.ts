import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class FinanceReportQuery {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(['daily', 'monthly', 'yearly'])
  groupBy: 'daily' | 'monthly' | 'yearly';

  @IsOptional()
  @IsString()
  category?: string;
}
