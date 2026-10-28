import {
  Product as PrismaProduct,
  ProductCategory as PrismaProductCategory,
  ProductStatus as PrismaProductStatus,
} from '@prisma/client';
import { Product, ProductCategory, ProductStatus } from '@app/entities/product';

export class ProductMapper {
  static toDomain(raw: PrismaProduct): Product {
    return new Product(
      {
        name: raw.name,
        category: raw.category as ProductCategory,
        price: raw.price,
        cost: raw.cost,
        stock: raw.stock,
        minStock: raw.minStock,
        unit: raw.unit,
        status: raw.status as ProductStatus,
        description: raw.description,
        imageUrl: raw.imageUrl,
        supplierId: raw.supplierId,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(product: Product): PrismaProduct {
    return {
      id: product.id,
      name: product.name,
      category: product.category as PrismaProductCategory,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      status: product.status as PrismaProductStatus,
      description: product.description || null,
      imageUrl: product.imageUrl || null,
      supplierId: product.supplierId || null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
