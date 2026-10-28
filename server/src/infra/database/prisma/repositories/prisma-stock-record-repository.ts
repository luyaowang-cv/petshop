import { Injectable } from '@nestjs/common';
import {
  StockRecordRepository,
  StockRecordListParams,
  StockRecordListResponse,
} from 'src/app/repositories/stock-record-repository';
import { StockRecord } from 'src/app/entities/stock-record';
import { PrismaService } from '../prisma.service';
import { StockRecordMapper } from '../mappers/stock-record-mapper';

@Injectable()
export class PrismaStockRecordRepository implements StockRecordRepository {
  constructor(private prisma: PrismaService) {}

  async create(stockRecord: StockRecord): Promise<void> {
    const data = StockRecordMapper.toPrisma(stockRecord);

    await this.prisma.stockRecord.create({
      data,
    });
  }

  async findById(id: string): Promise<StockRecord | null> {
    const stockRecord = await this.prisma.stockRecord.findUnique({
      where: { id },
    });

    if (!stockRecord) {
      return null;
    }

    return StockRecordMapper.toDomain(stockRecord);
  }

  async list(params: StockRecordListParams): Promise<StockRecordListResponse> {
    const { page = 1, pageSize = 10, productId, startDate, endDate } = params;

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [stockRecords, total] = await Promise.all([
      this.prisma.stockRecord.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
        },
      }),
      this.prisma.stockRecord.count({ where }),
    ]);

    return {
      data: stockRecords.map(StockRecordMapper.toDomain),
      total,
      page,
      pageSize,
    };
  }
}
