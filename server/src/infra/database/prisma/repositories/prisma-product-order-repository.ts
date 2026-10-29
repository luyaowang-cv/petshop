import { Injectable } from '@nestjs/common';
import {
  ProductOrderRepository,
  ProductOrderFilters,
} from 'src/app/repositories/product-order-repository';
import { ProductOrder } from 'src/app/entities/product-order';
import { PrismaService } from '../prisma.service';
import { ProductOrderMapper } from '../mappers/product-order-mapper';
import { PaginateOptions } from 'src/app/repositories/utils/pagination';
import { SortOptions } from 'src/app/repositories/utils/sort';

@Injectable()
export class PrismaProductOrderRepository implements ProductOrderRepository {
  constructor(private prisma: PrismaService) {}

  async create(order: ProductOrder): Promise<void> {
    const data = ProductOrderMapper.toPrisma(order);

    await this.prisma.productOrder.create({
      data: {
        ...data,
        items: {
          create: order.items.map((item) =>
            ProductOrderMapper.toPrismaItem(item),
          ),
        },
      },
    });
  }

  async findById(id: string): Promise<ProductOrder | null> {
    const order = await this.prisma.productOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) return null;

    return ProductOrderMapper.toDomain(order);
  }

  async findMany(
    filters?: ProductOrderFilters,
    pagination?: PaginateOptions,
    sort?: SortOptions<string>,
  ): Promise<{ orders: ProductOrder[]; total: number }> {
    const where: any = {};

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.status) {
      where.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // 未传分页参数时返回全部记录（统计类查询需要完整数据）
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;
    const skip = pagination ? (page - 1) * pageSize : undefined;
    const take = pagination ? pageSize : undefined;

    const [orders, total] = await Promise.all([
      this.prisma.productOrder.findMany({
        where,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        skip,
        take,
        orderBy: sort?.sortBy
          ? { [sort.sortBy]: sort.sortOrder || 'desc' }
          : { createdAt: 'desc' },
      }),
      this.prisma.productOrder.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ProductOrderMapper.toDomain(order)),
      total,
    };
  }

  async update(order: ProductOrder): Promise<void> {
    const data = ProductOrderMapper.toPrisma(order);

    await this.prisma.productOrder.update({
      where: { id: order.id },
      data: {
        status: data.status,
        note: data.note,
        totalAmount: data.totalAmount,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.productOrder.delete({
      where: { id },
    });
  }
}
