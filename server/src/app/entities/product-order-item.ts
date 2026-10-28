import { BaseEntity } from './base-entity';
import { Product } from './product';

export interface ProductOrderItemProps {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product?: Product;
  createdAt: Date;
}

export class ProductOrderItem extends BaseEntity<ProductOrderItemProps> {
  public get orderId() {
    return this.props.orderId;
  }

  public set orderId(orderId: string) {
    this.props.orderId = orderId;
  }

  public get productId() {
    return this.props.productId;
  }

  public set productId(productId: string) {
    this.props.productId = productId;
  }

  public get quantity() {
    return this.props.quantity;
  }

  public set quantity(quantity: number) {
    this.props.quantity = quantity;
  }

  public get price() {
    return this.props.price;
  }

  public set price(price: number) {
    this.props.price = price;
  }

  public get subtotal() {
    return this.props.subtotal;
  }

  public set subtotal(subtotal: number) {
    this.props.subtotal = subtotal;
  }

  public get product() {
    return this.props.product;
  }

  public set product(product: Product | undefined) {
    this.props.product = product;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  static create(props: ProductOrderItemProps, id?: string): ProductOrderItem {
    return new ProductOrderItem(props, id);
  }
}
