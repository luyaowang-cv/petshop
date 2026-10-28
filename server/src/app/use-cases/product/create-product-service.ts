import { Injectable } from '@nestjs/common';
import { Product, ProductCategory, ProductStatus } from '@app/entities/product';
import { ProductRepository } from '@app/repositories/product-repository';

interface CreateProductRequest {
  name: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  status?: ProductStatus;
  description?: string;
  imageUrl?: string;
  supplierId?: string;
}

@Injectable()
export class CreateProductService {
  constructor(private productRepository: ProductRepository) {}

  async execute(request: CreateProductRequest) {
    const {
      name,
      category,
      price,
      cost,
      stock,
      minStock,
      unit,
      status = ProductStatus.ACTIVE,
      description,
      imageUrl,
      supplierId,
    } = request;

    const product = new Product({
      name,
      category,
      price,
      cost,
      stock,
      minStock,
      unit,
      status,
      description: description || null,
      imageUrl: imageUrl || null,
      supplierId: supplierId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.productRepository.create(product);

    return {
      product,
    };
  }
}
