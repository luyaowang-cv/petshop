import { IsOptional, IsDateString } from 'class-validator';

export class RevenueStatisticsQuery {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
