import { ServiceCategory } from '@app/entities/service-category';

export class ServiceCategoryViewModel {
  static toHTTP(category: ServiceCategory) {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}
