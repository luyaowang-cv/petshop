import { Injectable } from '@nestjs/common';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { ServiceStatus } from '@app/entities/petshop-service';

interface EditPetshopServiceRequest {
  id: string;
  body: {
    title: string;
    description: string;
    categoryId: string;
    value: number;
    duration: number;
    status?: ServiceStatus;
    imageUrl?: string | null;
  };
}

@Injectable()
export class EditPetshopService {
  constructor(
    private petshopServiceRepository: PetshopServiceRepository,
    private serviceCategoryRepository: ServiceCategoryRepository,
  ) {}

  async execute(request: EditPetshopServiceRequest) {
    const petshopService = await this.petshopServiceRepository.findById(
      request.id,
    );

    if (!petshopService) {
      throw new EntityNotFound('Service', request.id);
    }
    const body = request.body;

    const category = await this.serviceCategoryRepository.findById(
      body.categoryId,
    );
    if (!category) throw new EntityNotFound('ServiceCategory', body.categoryId);

    petshopService.title = body.title;
    petshopService.description = body.description;
    petshopService.categoryId = category.id;
    petshopService.category = category;
    petshopService.duration = body.duration;
    petshopService.value = body.value;
    if (body.status) {
      petshopService.status = body.status;
    }
    petshopService.imageUrl = body.imageUrl ?? null;

    await this.petshopServiceRepository.save(petshopService);

    return {
      petshopService,
    };
  }
}
