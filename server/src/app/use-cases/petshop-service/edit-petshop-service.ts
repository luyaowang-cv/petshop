import { Injectable } from '@nestjs/common';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { ServiceCategory, ServiceStatus } from '@app/entities/petshop-service';

interface EditPetshopServiceRequest {
  id: string;
  body: {
    title: string;
    description: string;
    category: ServiceCategory;
    value: number;
    duration: number;
    status?: ServiceStatus;
    imageUrl?: string | null;
  };
}

@Injectable()
export class EditPetshopService {
  constructor(private petshopServiceRepository: PetshopServiceRepository) {}

  async execute(request: EditPetshopServiceRequest) {
    const petshopService = await this.petshopServiceRepository.findById(
      request.id,
    );

    if (!petshopService) {
      throw new EntityNotFound('Service', request.id);
    }
    const body = request.body;

    petshopService.title = body.title;
    petshopService.description = body.description;
    petshopService.category = body.category;
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
