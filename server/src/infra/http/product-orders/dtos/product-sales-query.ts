import { IsOptional, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductSalesQuery {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  category?: string;
}
