import { RechargeRecord } from '@app/entities/recharge-record';

export class RechargeRecordViewModel {
  static toHTTP(record: RechargeRecord) {
    return {
      id: record.id,
      customerId: record.customerId,
      amount: record.amount,
      balance: record.balance,
      operator: record.operator,
      note: record.note,
      createdAt: record.createdAt,
    };
  }
}
