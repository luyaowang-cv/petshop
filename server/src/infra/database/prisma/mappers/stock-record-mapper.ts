import { StockRecord as PrismaStockRecord, StockInType } from '@prisma/client';
import {
  StockRecord,
  StockInType as DomainStockInType,
} from 'src/app/entities/stock-record';

export class StockRecordMapper {
  static toDomain(raw: PrismaStockRecord): StockRecord {
    return new StockRecord(
      {
        productId: raw.productId,
        quantity: raw.quantity,
        type: raw.type as DomainStockInType,
        cost: raw.cost,
        totalCost: raw.totalCost,
        supplier: raw.supplier,
        operator: raw.operator,
        note: raw.note,
        createdAt: raw.createdAt,
      },
      raw.id,
    );
  }

  static toPrisma(stockRecord: StockRecord) {
    return {
      id: stockRecord.id,
      productId: stockRecord.productId,
      quantity: stockRecord.quantity,
      type: stockRecord.type as StockInType,
      cost: stockRecord.cost,
      totalCost: stockRecord.totalCost,
      supplier: stockRecord.supplier,
      operator: stockRecord.operator,
      note: stockRecord.note,
      createdAt: stockRecord.createdAt,
    };
  }
}
