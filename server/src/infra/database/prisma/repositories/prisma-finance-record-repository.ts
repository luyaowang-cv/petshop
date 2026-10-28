import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  FinanceRecordRepository,
  FindAllFinanceRecordsParams,
  PaginatedFinanceRecords,
} from '@app/repositories/finance-record-repository';
import { FinanceRecord, FinanceType } from '@app/entities/finance-record';
import { FinanceRecordMapper } from '../mappers/finance-record-mapper';

@Injectable()
export class PrismaFinanceRecordRepository implements FinanceRecordRepository {
  constructor(private prisma: PrismaService) {}

  async create(record: FinanceRecord): Promise<FinanceRecord> {
    const data = FinanceRecordMapper.toPrisma(record);
    const created = await this.prisma.financeRecord.create({
      data: {
        ...data,
        id: undefined, // Let Prisma generate the ID
      },
    });
    return FinanceRecordMapper.toDomain(created);
  }

  async findAll(
    params: FindAllFinanceRecordsParams,
  ): Promise<PaginatedFinanceRecords> {
    const {
      page = 1,
      pageSize = 20,
      type,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        where.date.lte = endDate;
      }
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [records, total] = await Promise.all([
      this.prisma.financeRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.financeRecord.count({ where }),
    ]);

    return {
      data: records.map(FinanceRecordMapper.toDomain),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string): Promise<FinanceRecord | null> {
    const record = await this.prisma.financeRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return FinanceRecordMapper.toDomain(record);
  }

  async update(record: FinanceRecord): Promise<FinanceRecord> {
    const data = FinanceRecordMapper.toPrisma(record);
    const updated = await this.prisma.financeRecord.update({
      where: { id: record.id },
      data: {
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date,
      },
    });
    return FinanceRecordMapper.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.financeRecord.delete({
      where: { id },
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    type?: FinanceType,
    category?: string,
  ): Promise<FinanceRecord[]> {
    const where: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    const records = await this.prisma.financeRecord.findMany({
      where,
      orderBy: {
        date: 'asc',
      },
    });

    return records.map(FinanceRecordMapper.toDomain);
  }
}
