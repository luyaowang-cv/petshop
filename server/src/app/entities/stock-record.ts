import { BaseEntity } from './base-entity';

export enum StockInType {
  PURCHASE = 'PURCHASE', // 采购入库
  ADJUSTMENT = 'ADJUSTMENT', // 库存调整
}

export interface StockRecordProps {
  productId: string;
  quantity: number;
  type: StockInType;
  cost: number;
  totalCost: number;
  supplier?: string | null;
  operator: string;
  note?: string | null;
  createdAt: Date;
}

export class StockRecord extends BaseEntity<StockRecordProps> {
  get productId() {
    return this.props.productId;
  }

  get quantity() {
    return this.props.quantity;
  }

  get type() {
    return this.props.type;
  }

  get cost() {
    return this.props.cost;
  }

  get totalCost() {
    return this.props.totalCost;
  }

  get supplier() {
    return this.props.supplier;
  }

  get operator() {
    return this.props.operator;
  }

  get note() {
    return this.props.note;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
