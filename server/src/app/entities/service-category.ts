import { BaseEntity } from './base-entity';

interface ServiceCategoryProps {
  name: string;
  icon?: string | null;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ServiceCategory extends BaseEntity<ServiceCategoryProps> {
  constructor(props: ServiceCategoryProps, id?: string) {
    super(
      {
        ...props,
        icon: props.icon ?? null,
        sortOrder: props.sortOrder ?? 0,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    );
  }

  public get name() {
    return this.props.name;
  }

  public set name(name: string) {
    this.props.name = name;
  }

  public get icon() {
    return this.props.icon ?? null;
  }

  public set icon(icon: string | null) {
    this.props.icon = icon;
  }

  public get sortOrder() {
    return this.props.sortOrder!;
  }

  public set sortOrder(sortOrder: number) {
    this.props.sortOrder = sortOrder;
  }

  public get createdAt() {
    return this.props.createdAt!;
  }

  public get updatedAt() {
    return this.props.updatedAt!;
  }

  public set updatedAt(date: Date) {
    this.props.updatedAt = date;
  }
}
