import { Injectable } from '@nestjs/common';
import {
  SmsRecordRepository,
  FindSmsRecordsParams,
  FindSmsRecordsResult,
} from '@app/repositories/sms-record-repository';
import { SmsRecord } from '@app/entities/sms-record';
import { PrismaService } from '../prisma.service';
import { SmsRecordMapper } from '../mappers/sms-record-mapper';

@Injectable()
export class PrismaSmsRecordRepository implements SmsRecordRepository {
  constructor(private prisma: PrismaService) {}

  async create(record: SmsRecord): Promise<SmsRecord> {
    const data = SmsRecordMapper.toPrisma(record);

    const raw = await this.prisma.smsRecord.create({
      data,
    });

    return SmsRecordMapper.toDomain(raw);
  }

  async findMany(params: FindSmsRecordsParams): Promise<FindSmsRecordsResult> {
    const { page = 1, pageSize = 20, ...filters } = params;

    const where: any = {};

    if (filters.phoneNumber) {
      where.phoneNumber = { contains: filters.phoneNumber };
    }

    if (filters.scenario) {
      where.scenario = filters.scenario;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.startDate || filters.endDate) {
      where.sentAt = {};
      if (filters.startDate) {
        where.sentAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.sentAt.lte = filters.endDate;
      }
    }

    const [records, total] = await Promise.all([
      this.prisma.smsRecord.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sentAt: 'desc' },
      }),
      this.prisma.smsRecord.count({ where }),
    ]);

    return {
      records: records.map(SmsRecordMapper.toDomain),
      total,
    };
  }

  async count(
    params?: Omit<FindSmsRecordsParams, 'page' | 'pageSize'>,
  ): Promise<number> {
    const where: any = {};

    if (params?.phoneNumber) {
      where.phoneNumber = { contains: params.phoneNumber };
    }

    if (params?.scenario) {
      where.scenario = params.scenario;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.customerId) {
      where.customerId = params.customerId;
    }

    if (params?.startDate || params?.endDate) {
      where.sentAt = {};
      if (params.startDate) {
        where.sentAt.gte = params.startDate;
      }
      if (params.endDate) {
        where.sentAt.lte = params.endDate;
      }
    }

    return this.prisma.smsRecord.count({ where });
  }
}
