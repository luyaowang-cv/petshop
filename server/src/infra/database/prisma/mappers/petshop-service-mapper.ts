import {
  PetshopService,
  ServiceCategory,
  ServiceStatus,
} from '@app/entities/petshop-service';
import { PetshopService as RawPetshopService } from '@prisma/client';

export class PetshopServiceMapper {
  static toPrisma(petshopService: PetshopService) {
    return {
      id: petshopService.id,
      title: petshopService.title,
      description: petshopService.description,
      category: petshopService.category,
      duration: petshopService.duration,
      value: petshopService.value,
      imageUrl: petshopService.imageUrl,
      status: petshopService.status,
      createdAt: petshopService.createdAt,
      updatedAt: petshopService.updatedAt,
    };
  }

  static toDomain(raw: RawPetshopService) {
    return new PetshopService(
      {
        title: raw.title,
        description: raw.description,
        category: raw.category as ServiceCategory,
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
