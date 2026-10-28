import { PetshopService } from '@app/entities/petshop-service';

export class PetshopServiceViewModel {
  static toHTTP(petshopService: PetshopService) {
    return {
      id: petshopService.id,
      title: petshopService.title,
      description: petshopService.description,
      category: petshopService.category,
      value: petshopService.value,
      duration: petshopService.duration,
      imageUrl: petshopService.imageUrl,
      status: petshopService.status,
      createdAt: petshopService.createdAt.toISOString(),
      updatedAt: petshopService.updatedAt.toISOString(),
    };
  }
}
