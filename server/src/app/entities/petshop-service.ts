import { BaseEntity } from './base-entity';
import { ServiceCategory } from './service-category';

export enum ServiceStatus {
  ACTIVE = 'ACTIVE', // 启用
  INACTIVE = 'INACTIVE', // 停用
}

export interface PetshopServiceProps {
  title: string;
  description: string;
  /** 所属分类 id（可选，分类被删除后会置空） */
  categoryId?: string | null;
  /** 关联的分类对象，查询时一并带出 */
  category?: ServiceCategory | null;
  value: number;
  duration?: number; // 可选，保留以便后续扩展
  imageUrl?: string | null;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class PetshopService extends BaseEntity<PetshopServiceProps> {
  public get title() {
    return this.props.title;
  }

  public set title(title: string) {
    this.props.title = title;
  }

  public get description() {
    return this.props.description;
  }

  public set description(description: string) {
    this.props.description = description;
  }

  public get categoryId() {
    return this.props.categoryId ?? null;
  }

  public set categoryId(categoryId: string | null | undefined) {
    this.props.categoryId = categoryId ?? null;
  }

  public get category() {
    return this.props.category ?? null;
  }

  public set category(category: ServiceCategory | null | undefined) {
    this.props.category = category ?? null;
  }

  /** 分类名称，便于业务判断（如是否属于洗护类） */
  public get categoryName() {
    return this.props.category?.name ?? null;
  }

  public get value() {
    return this.props.value;
  }

  public set value(value: number) {
    this.props.value = value;
  }

  public get duration() {
    return this.props.duration;
  }

  public set duration(duration: number | undefined) {
    this.props.duration = duration;
  }

  public get imageUrl() {
    return this.props.imageUrl ?? null;
  }

  public set imageUrl(imageUrl: string | null | undefined) {
    this.props.imageUrl = imageUrl;
  }

  public get status() {
    return this.props.status;
  }

  public set status(status: ServiceStatus) {
    this.props.status = status;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
}
