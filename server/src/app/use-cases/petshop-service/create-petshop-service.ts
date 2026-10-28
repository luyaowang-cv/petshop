import {
  PetshopService,
  ServiceCategory,
  ServiceStatus,
} from '@app/entities/petshop-service';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { Injectable } from '@nestjs/common';

interface PetshopServiceRequest {
  title: string;
  description: string;
  category: ServiceCategory;
  value: number;
  duration: number;
  status?: ServiceStatus;
  imageUrl?: string | null;
}

@Injectable()
export class CreatePetshopService {
  constructor(private petshopServiceRepository: PetshopServiceRepository) {}

  async execute(request: PetshopServiceRequest) {
    const petshopService = new PetshopService({
      title: request.title,
      description: request.description,
      category: request.category,
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
