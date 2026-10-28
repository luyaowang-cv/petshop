import { Injectable } from '@nestjs/common';
import { ProductOrder } from 'src/app/entities/product-order';
import {
  ProductOrderRepository,
  ProductOrderFilters,
} from 'src/app/repositories/product-order-repository';
import { PaginateOptions } from 'src/app/repositories/utils/pagination';
import { SortOptions } from 'src/app/repositories/utils/sort';

interface ListProductOrdersRequest {
  filters?: ProductOrderFilters;
  pagination?: PaginateOptions;
  sort?: SortOptions<string>;
}

interface ListProductOrdersResponse {
  orders: ProductOrder[];
  total: number;
}

@Injectable()
export class ListProductOrdersService {
  constructor(private productOrderRepository: ProductOrderRepository) {}

  async execute(
    request: ListProductOrdersRequest,
  ): Promise<ListProductOrdersResponse> {
    const { filters, pagination, sort } = request;

    const result = await this.productOrderRepository.findMany(
      filters,
      pagination,
      sort,
    );

    return result;
  }
}
