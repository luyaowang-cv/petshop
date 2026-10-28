import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@app/repositories/product-repository';
import { ProductCategory } from '@app/entities/product';

interface UpdateProductRequest {
  id: string;
  body: {
    name?: string;
    category?: ProductCategory;
    price?: number;
    cost?: number;
    stock?: number;
    minStock?: number;
    unit?: string;
    description?: string;
    imageUrl?: string;
    supplierId?: string;
  };
}

@Injectable()
export class UpdateProductService {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: UpdateProductRequest) {
    const { id, body } = request;

    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('商品不存在');
    }

    // 更新商品属性
    if (body.name !== undefined) product.name = body.name;
    if (body.category !== undefined) product.category = body.category;
    if (body.price !== undefined) product.price = body.price;
    if (body.cost !== undefined) product.cost = body.cost;
    if (body.stock !== undefined) product.stock = body.stock;
    if (body.minStock !== undefined) product.minStock = body.minStock;
    if (body.unit !== undefined) product.unit = body.unit;
    if (body.description !== undefined) product.description = body.description;
    if (body.imageUrl !== undefined) product.imageUrl = body.imageUrl;
    if (body.supplierId !== undefined) product.supplierId = body.supplierId;

    await this.productRepository.save(product);

    return {
      product,
    };
  }
}
