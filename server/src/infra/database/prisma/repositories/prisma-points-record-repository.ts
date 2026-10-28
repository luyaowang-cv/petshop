import { Injectable } from '@nestjs/common';
import { PointsRecordRepository } from 'src/app/repositories/points-record-repository';
import { PointsRecord } from 'src/app/entities/points-record';
import { PrismaService } from '../prisma.service';
import { PointsRecordMapper } from '../mappers/points-record-mapper';

@Injectable()
export class PrismaPointsRecordRepository implements PointsRecordRepository {
  constructor(private prisma: PrismaService) {}

  async create(record: PointsRecord): Promise<void> {
    const data = PointsRecordMapper.toPrisma(record);
    await this.prisma.pointsRecord.create({ data });
  }

  async findByCustomerId(customerId: string): Promise<PointsRecord[]> {
    const records = await this.prisma.pointsRecord.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(PointsRecordMapper.toDomain);
  }
}
