import { PointsRecord as PrismaPointsRecord } from '@prisma/client';
import { PointsRecord, PointsAction } from 'src/app/entities/points-record';

export class PointsRecordMapper {
  static toDomain(raw: PrismaPointsRecord): PointsRecord {
    return PointsRecord.create(
      {
        customerId: raw.customerId,
        action: raw.action as PointsAction,
        points: raw.points,
        balance: raw.balance,
        reason: raw.reason,
        operator: raw.operator,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }

  static toPrisma(record: PointsRecord) {
    return {
      id: record.id,
      customerId: record.customerId,
      action: record.action,
      points: record.points,
      balance: record.balance,
      reason: record.reason || '',
      operator: record.operator || '',
      createdAt: record.createdAt,
    };
  }
}
