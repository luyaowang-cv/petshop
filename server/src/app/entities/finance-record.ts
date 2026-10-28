import { BaseEntity } from './base-entity';

export enum FinanceType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

interface FinanceRecordProps {
  type: FinanceType;
  category: string;
  amount: number; // In cents
  description?: string | null;
  date: Date;
}

export class FinanceRecord extends BaseEntity<FinanceRecordProps> {
  constructor(props: FinanceRecordProps, id?: string) {
    super(props, id);
  }

  public get type() {
    return this.props.type;
  }

  public get category() {
    return this.props.category;
  }

  public get amount() {
    return this.props.amount;
  }

  public get description() {
    return this.props.description;
  }

  public get date() {
    return this.props.date;
  }

  public set category(category: string) {
    this.props.category = category;
  }

  public set amount(amount: number) {
    this.props.amount = amount;
  }

  public set description(description: string | null | undefined) {
    this.props.description = description;
  }

  public set date(date: Date) {
    this.props.date = date;
  }
}
