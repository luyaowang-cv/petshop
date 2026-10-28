import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@app/repositories/product-repository';
import { ProductStatus } from '@app/entities/product';

@Injectable()
export class ToggleProductStatusService {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    // 切换状态
    product.status =
      product.status === ProductStatus.ACTIVE
        ? ProductStatus.INACTIVE
        : ProductStatus.ACTIVE;

    await this.productRepository.save(product);

    return {
      product,
    };
  }
}
