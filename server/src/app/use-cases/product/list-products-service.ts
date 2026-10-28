import { Injectable } from '@nestjs/common';
import {
  ProductRepository,
  ProductListParams,
} from '@app/repositories/product-repository';

@Injectable()
export class ListProductsService {
  constructor(private productRepository: ProductRepository) {}

  async execute(params: ProductListParams) {
    const { products, total } = await this.productRepository.findMany(params);

    return {
      products,
      total,
    };
  }
}
