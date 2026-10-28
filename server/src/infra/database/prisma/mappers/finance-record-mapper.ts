import {
  FinanceRecord as PrismaFinanceRecord,
  FinanceType as PrismaFinanceType,
} from '@prisma/client';
import { FinanceRecord, FinanceType } from '@app/entities/finance-record';

export class FinanceRecordMapper {
  static toDomain(raw: PrismaFinanceRecord): FinanceRecord {
    return new FinanceRecord(
      {
        type: raw.type as FinanceType,
        category: raw.category,
        amount: raw.amount,
        description: raw.description,
        date: raw.date,
      },
      raw.id,
    );
  }

  static toPrisma(
    record: FinanceRecord,
  ): Omit<PrismaFinanceRecord, 'createdAt' | 'updatedAt'> {
    return {
      id: record.id,
      type: record.type as PrismaFinanceType,
      category: record.category,
      amount: record.amount,
      description: record.description || null,
      date: record.date,
    };
  }
}
