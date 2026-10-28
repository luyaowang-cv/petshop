import { Product } from '@app/entities/product';

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListResult {
  products: Product[];
  total: number;
}

export abstract class ProductRepository {
  abstract findById(id: string): Promise<Product | null>;
  abstract findMany(params: ProductListParams): Promise<ProductListResult>;
  abstract create(product: Product): Promise<void>;
  abstract save(product: Product): Promise<void>;
  abstract deleteById(id: string): Promise<void>;
}
