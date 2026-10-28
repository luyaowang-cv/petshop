import { BaseEntity } from './base-entity';

export enum ServiceCategory {
  GROOMING = 'GROOMING', // 洗护
  MEDICAL = 'MEDICAL', // 医疗
  BOARDING = 'BOARDING', // 寄养
}

export enum ServiceStatus {
  ACTIVE = 'ACTIVE', // 启用
  INACTIVE = 'INACTIVE', // 停用
}

export interface PetshopServiceProps {
  title: string;
  description: string;
  category: ServiceCategory;
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

  public get category() {
    return this.props.category;
  }

  public set category(category: ServiceCategory) {
    this.props.category = category;
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
