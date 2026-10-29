import { Injectable } from '@nestjs/common';
import { ServiceCategory } from '@app/entities/service-category';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';
import { BadRequest } from '../errors/bad-request';

interface CreateServiceCategoryRequest {
  name: string;
  icon?: string | null;
  sortOrder?: number;
}

@Injectable()
export class CreateServiceCategory {
  constructor(private serviceCategoryRepository: ServiceCategoryRepository) {}

  async execute(request: CreateServiceCategoryRequest) {
    const name = request.name.trim();
    if (!name) throw new BadRequest('分类名称不能为空');

    const existing = await this.serviceCategoryRepository.findByName(name);
    if (existing) throw new BadRequest('该分类名称已存在');

    const category = new ServiceCategory({
      name,
      icon: request.icon ?? null,
      sortOrder: request.sortOrder ?? 0,
    });

    await this.serviceCategoryRepository.create(category);

    return { category };
  }
}
