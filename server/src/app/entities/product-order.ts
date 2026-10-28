import { BaseEntity } from './base-entity';
import { ProductOrderItem } from './product-order-item';

export enum ProductOrderStatus {
  PENDING = 'PENDING', // 待处理
  CONFIRMED = 'CONFIRMED', // 已确认
  COMPLETED = 'COMPLETED', // 已完成
  CANCELED = 'CANCELED', // 已取消
}

export interface ProductOrderProps {
  customerId?: string; // 可选，支持散客
  totalAmount: number;
  status: ProductOrderStatus;
  note?: string;
  items: ProductOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class ProductOrder extends BaseEntity<ProductOrderProps> {
  public get customerId() {
    return this.props.customerId;
  }

  public set customerId(customerId: string | undefined) {
    this.props.customerId = customerId;
  }

  public get totalAmount() {
    return this.props.totalAmount;
  }

  public set totalAmount(totalAmount: number) {
    this.props.totalAmount = totalAmount;
  }

  public get status() {
    return this.props.status;
  }

  public set status(status: ProductOrderStatus) {
    this.props.status = status;
  }

  public get note() {
    return this.props.note;
  }

  public set note(note: string | undefined) {
    this.props.note = note;
  }

  public get items() {
    return this.props.items;
  }

  public set items(items: ProductOrderItem[]) {
    this.props.items = items;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }

  static create(props: ProductOrderProps, id?: string): ProductOrder {
    return new ProductOrder(props, id);
  }
}
