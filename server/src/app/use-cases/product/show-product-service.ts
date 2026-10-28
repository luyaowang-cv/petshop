import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@app/repositories/product-repository';

@Injectable()
export class ShowProductService {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    return {
      product,
    };
  }
}
