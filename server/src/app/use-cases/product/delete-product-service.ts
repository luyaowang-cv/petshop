import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@app/repositories/product-repository';

@Injectable()
export class DeleteProductService {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    await this.productRepository.deleteById(id);

    return {
      message: '商品删除成功',
    };
  }
}
