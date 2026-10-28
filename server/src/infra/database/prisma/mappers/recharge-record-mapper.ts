import { RechargeRecord as PrismaRechargeRecord } from '@prisma/client';
import { RechargeRecord } from 'src/app/entities/recharge-record';

export class RechargeRecordMapper {
  static toDomain(raw: PrismaRechargeRecord): RechargeRecord {
    return RechargeRecord.create(
      {
        customerId: raw.customerId,
        amount: raw.amount,
        balance: raw.balance,
        operator: raw.operator,
        note: raw.note,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }

  static toPrisma(record: RechargeRecord) {
    return {
      id: record.id,
      customerId: record.customerId,
      amount: record.amount,
      balance: record.balance,
      operator: record.operator || '',
      note: record.note || null,
      createdAt: record.createdAt,
    };
  }
}
