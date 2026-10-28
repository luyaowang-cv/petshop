import { PointsRecord } from '@app/entities/points-record';

export class PointsRecordViewModel {
  static toHTTP(record: PointsRecord) {
    return {
      id: record.id,
      customerId: record.customerId,
      action: record.action,
      points: record.points,
      balance: record.balance,
      reason: record.reason,
      operator: record.operator,
      createdAt: record.createdAt,
    };
  }
}
