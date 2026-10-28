import { StockRecord } from 'src/app/entities/stock-record';

export class StockRecordViewModel {
  static toHTTP(stockRecord: StockRecord) {
    return {
      id: stockRecord.id,
      productId: stockRecord.productId,
      quantity: stockRecord.quantity,
      type: stockRecord.type,
      cost: stockRecord.cost,
      totalCost: stockRecord.totalCost,
      supplier: stockRecord.supplier,
      operator: stockRecord.operator,
      note: stockRecord.note,
      createdAt: stockRecord.createdAt,
    };
  }
}
