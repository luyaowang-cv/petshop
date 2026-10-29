import { PetshopService } from '@app/entities/petshop-service';
import { ServiceCategoryViewModel } from './service-category-view-model';

export class PetshopServiceViewModel {
  static toHTTP(petshopService: PetshopService) {
    return {
      id: petshopService.id,
      title: petshopService.title,
      description: petshopService.description,
      categoryId: petshopService.categoryId,
      category: petshopService.category
        ? ServiceCategoryViewModel.toHTTP(petshopService.category)
        : null,
      value: petshopService.value,
      duration: petshopService.duration,
      imageUrl: petshopService.imageUrl,
      status: petshopService.status,
      createdAt: petshopService.createdAt.toISOString(),
      updatedAt: petshopService.updatedAt.toISOString(),
    };
  }
}
