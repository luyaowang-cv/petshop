import { PetshopService, ServiceStatus } from '@app/entities/petshop-service';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';
import { Injectable } from '@nestjs/common';
import { EntityNotFound } from '../errors/entity-not-found';

interface PetshopServiceRequest {
  title: string;
  description: string;
  categoryId: string;
  value: number;
  duration: number;
  status?: ServiceStatus;
  imageUrl?: string | null;
}

@Injectable()
export class CreatePetshopService {
  constructor(
    private petshopServiceRepository: PetshopServiceRepository,
    private serviceCategoryRepository: ServiceCategoryRepository,
  ) {}

  async execute(request: PetshopServiceRequest) {
    const category = await this.serviceCategoryRepository.findById(
      request.categoryId,
    );
    if (!category) throw new EntityNotFound('ServiceCategory', request.categoryId);

    const petshopService = new PetshopService({
      title: request.title,
      description: request.description,
      categoryId: category.id,
      category,
      value: request.value,
      duration: request.duration,
      imageUrl: request.imageUrl || null,
      status: request.status || ServiceStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.petshopServiceRepository.create(petshopService);

    return {
      petshopService,
    };
  }
}
