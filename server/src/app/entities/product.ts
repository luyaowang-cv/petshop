import { BaseEntity } from './base-entity';

export enum ProductCategory {
  FOOD = 'FOOD',
  SUPPLIES = 'SUPPLIES',
  MEDICINE = 'MEDICINE',
  TOY = 'TOY',
  OTHER = 'OTHER',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

interface ProductProps {
  name: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  status: ProductStatus;
  description?: string | null;
  imageUrl?: string | null;
  supplierId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Product extends BaseEntity<ProductProps> {
  constructor(props: ProductProps, id?: string) {
    super(props, id);
  }

  public get name() {
    return this.props.name;
  }

  public set name(name: string) {
    this.props.name = name;
  }

  public get category() {
    return this.props.category;
  }

  public set category(category: ProductCategory) {
    this.props.category = category;
  }

  public get price() {
    return this.props.price;
  }

  public set price(price: number) {
    this.props.price = price;
  }

  public get cost() {
    return this.props.cost;
  }

  public set cost(cost: number) {
    this.props.cost = cost;
  }

  public get stock() {
    return this.props.stock;
  }

  public set stock(stock: number) {
    this.props.stock = stock;
  }

  public get minStock() {
    return this.props.minStock;
  }

  public set minStock(minStock: number) {
    this.props.minStock = minStock;
  }

  public get unit() {
    return this.props.unit;
  }

  public set unit(unit: string) {
    this.props.unit = unit;
  }

  public get status() {
    return this.props.status;
  }

  public set status(status: ProductStatus) {
    this.props.status = status;
  }

  public get description() {
    return this.props.description;
  }

  public set description(description: string | null | undefined) {
    this.props.description = description;
  }

  public get imageUrl() {
    return this.props.imageUrl;
  }

  public set imageUrl(imageUrl: string | null | undefined) {
    this.props.imageUrl = imageUrl;
  }

  public get supplierId() {
    return this.props.supplierId;
  }

  public set supplierId(supplierId: string | null | undefined) {
    this.props.supplierId = supplierId;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }

  public get isLowStock(): boolean {
    return this.stock <= this.minStock;
  }

  public addStock(quantity: number): void {
    this.props.stock += quantity;
    this.props.updatedAt = new Date();
  }

  public reduceStock(quantity: number): void {
    if (this.props.stock < quantity) {
      throw new Error('库存不足');
    }
    this.props.stock -= quantity;
    this.props.updatedAt = new Date();
  }

  public updateCost(cost: number): void {
    this.props.cost = cost;
    this.props.updatedAt = new Date();
  }
}
