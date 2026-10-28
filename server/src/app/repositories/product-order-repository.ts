import { ProductOrder } from '../entities/product-order';
import { PaginateOptions } from './utils/pagination';
import { SortOptions } from './utils/sort';

export interface ProductOrderFilters {
  customerId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export abstract class ProductOrderRepository {
  abstract create(order: ProductOrder): Promise<void>;
  abstract findById(id: string): Promise<ProductOrder | null>;
  abstract findMany(
    filters?: ProductOrderFilters,
    pagination?: PaginateOptions,
    sort?: SortOptions<string>,
  ): Promise<{ orders: ProductOrder[]; total: number }>;
  abstract update(order: ProductOrder): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
