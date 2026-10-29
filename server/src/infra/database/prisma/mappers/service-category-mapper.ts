import { ServiceCategory } from '@app/entities/service-category';
import { ServiceCategory as RawServiceCategory } from '@prisma/client';

export class ServiceCategoryMapper {
  static toPrisma(category: ServiceCategory) {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  static toDomain(raw: RawServiceCategory) {
    return new ServiceCategory(
      {
        name: raw.name,
        icon: raw.icon,
        sortOrder: raw.sortOrder,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
