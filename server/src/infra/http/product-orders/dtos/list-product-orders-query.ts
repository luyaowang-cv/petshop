import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ProductOrderStatus } from 'src/app/entities/product-order';
import { PaginateSortQuery } from '../../dtos/paginate-sort-query';

export class ListProductOrdersQuery extends PaginateSortQuery {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsEnum(ProductOrderStatus)
  status?: ProductOrderStatus;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
