import { ServiceStatus } from '@app/entities/petshop-service';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListActivePetshopServices {
  constructor(private petshopServiceRepository: PetshopServiceRepository) {}

  async execute() {
    const services = await this.petshopServiceRepository.findMany();

    return {
      petshopServices: services.filter(
        (service) => service.status === ServiceStatus.ACTIVE,
      ),
    };
  }
}
