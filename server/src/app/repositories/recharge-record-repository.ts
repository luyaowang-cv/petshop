import { RechargeRecord } from '../entities/recharge-record';

export abstract class RechargeRecordRepository {
  abstract create(record: RechargeRecord): Promise<void>;
  abstract findByCustomerId(customerId: string): Promise<RechargeRecord[]>;
}
