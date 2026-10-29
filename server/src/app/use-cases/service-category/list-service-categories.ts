import { Injectable } from '@nestjs/common';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';

@Injectable()
export class ListServiceCategories {
  constructor(private serviceCategoryRepository: ServiceCategoryRepository) {}

  async execute() {
    const categories = await this.serviceCategoryRepository.findMany();
    return { categories };
  }
}
