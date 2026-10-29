import { ServiceCategory } from '@app/entities/service-category';

export abstract class ServiceCategoryRepository {
  abstract create(category: ServiceCategory): Promise<void>;
  abstract save(category: ServiceCategory): Promise<void>;
  abstract findById(id: string): Promise<ServiceCategory | null>;
  abstract findByName(name: string): Promise<ServiceCategory | null>;
  abstract findMany(): Promise<ServiceCategory[]>;
  abstract deleteById(id: string): Promise<void>;
  abstract countServices(categoryId: string): Promise<number>;
}
