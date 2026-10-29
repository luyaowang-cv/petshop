import { PetshopService, ServiceStatus } from '@app/entities/petshop-service';
import {
  PetshopService as RawPetshopService,
  ServiceCategory as RawServiceCategory,
} from '@prisma/client';
import { ServiceCategoryMapper } from './service-category-mapper';

export type RawPetshopServiceWithCategory = RawPetshopService & {
  category?: RawServiceCategory | null;
};

export class PetshopServiceMapper {
  static toPrisma(petshopService: PetshopService) {
    return {
      id: petshopService.id,
      title: petshopService.title,
      description: petshopService.description,
      categoryId: petshopService.categoryId,
      duration: petshopService.duration,
      value: petshopService.value,
      imageUrl: petshopService.imageUrl,
      status: petshopService.status,
      createdAt: petshopService.createdAt,
      updatedAt: petshopService.updatedAt,
    };
  }

  static toDomain(raw: RawPetshopServiceWithCategory) {
    return new PetshopService(
      {
        title: raw.title,
        description: raw.description,
        categoryId: raw.categoryId,
        category: raw.category
          ? ServiceCategoryMapper.toDomain(raw.category)
          : null,
        duration: raw.duration ?? undefined,
        value: raw.value,
        imageUrl: raw.imageUrl,
        status: raw.status as ServiceStatus,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
