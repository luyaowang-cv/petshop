import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ProductRepository,
  ProductListParams,
  ProductListResult,
} from '@app/repositories/product-repository';
import { Product } from '@app/entities/product';
import { ProductMapper } from '../mappers/product-mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) return null;

    return ProductMapper.toDomain(product);
  }

  async findMany(params: ProductListParams): Promise<ProductListResult> {
    const {
      page = 1,
      pageSize = 10,
      search,
      category,
      sortField = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // 构建 where 条件
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (category) {
      where.category = category as any;
    }

    // 构建 orderBy 条件
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortField]: sortOrder,
    };

    // 查询数据
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map(ProductMapper.toDomain),
      total,
    };
  }

  async create(product: Product): Promise<void> {
    const data = ProductMapper.toPrisma(product);

    await this.prisma.product.create({
      data,
    });
  }

  async save(product: Product): Promise<void> {
    const data = ProductMapper.toPrisma(product);

    await this.prisma.product.update({
      where: { id: product.id },
      data,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }
}
