import { BaseEntity } from './base-entity';

export enum PointsAction {
  ADD = 'ADD',
  DEDUCT = 'DEDUCT',
  CONSUME = 'CONSUME',
  EXPIRE = 'EXPIRE',
}

export interface PointsRecordProps {
  customerId: string;
  action: PointsAction;
  points: number;
  balance: number;
  reason?: string | null;
  operator?: string | null;
  createdAt: Date;
}

export class PointsRecord extends BaseEntity<PointsRecordProps> {
  get customerId(): string {
    return this.props.customerId;
  }

  get action(): PointsAction {
    return this.props.action;
  }

  get points(): number {
    return this.props.points;
  }

  get balance(): number {
    return this.props.balance;
  }

  get reason(): string | null | undefined {
    return this.props.reason;
  }

  get operator(): string | null | undefined {
    return this.props.operator;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(props: PointsRecordProps, id?: string): PointsRecord {
    return new PointsRecord(props, id);
  }
}
