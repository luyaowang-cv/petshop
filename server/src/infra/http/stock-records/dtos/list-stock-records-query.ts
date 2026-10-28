import { IsOptional, IsString, IsDateString } from 'class-validator';
import { PaginateSortQuery } from '../../dtos/paginate-sort-query';

export class ListStockRecordsQuery extends PaginateSortQuery {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
