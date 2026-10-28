import { Injectable } from '@nestjs/common';
import { RechargeRecordRepository } from 'src/app/repositories/recharge-record-repository';
import { RechargeRecord } from 'src/app/entities/recharge-record';
import { PrismaService } from '../prisma.service';
import { RechargeRecordMapper } from '../mappers/recharge-record-mapper';

@Injectable()
export class PrismaRechargeRecordRepository
  implements RechargeRecordRepository
{
  constructor(private prisma: PrismaService) {}

  async create(record: RechargeRecord): Promise<void> {
    const data = RechargeRecordMapper.toPrisma(record);
    await this.prisma.rechargeRecord.create({ data });
  }

  async findByCustomerId(customerId: string): Promise<RechargeRecord[]> {
    const records = await this.prisma.rechargeRecord.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(RechargeRecordMapper.toDomain);
  }
}
