import { BaseEntity } from './base-entity';

export interface RechargeRecordProps {
  customerId: string;
  amount: number;
  balance: number;
  operator?: string | null;
  note?: string | null;
  createdAt: Date;
}

export class RechargeRecord extends BaseEntity<RechargeRecordProps> {
  get customerId(): string {
    return this.props.customerId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get balance(): number {
    return this.props.balance;
  }

  get operator(): string | null | undefined {
    return this.props.operator;
  }

  get note(): string | null | undefined {
    return this.props.note;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(props: RechargeRecordProps, id?: string): RechargeRecord {
    return new RechargeRecord(props, id);
  }
}
