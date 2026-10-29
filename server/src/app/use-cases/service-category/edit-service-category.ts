import { Injectable } from '@nestjs/common';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { BadRequest } from '../errors/bad-request';

interface EditServiceCategoryRequest {
  id: string;
  name?: string;
  icon?: string | null;
  sortOrder?: number;
}

@Injectable()
export class EditServiceCategory {
  constructor(private serviceCategoryRepository: ServiceCategoryRepository) {}

  async execute(request: EditServiceCategoryRequest) {
    const category = await this.serviceCategoryRepository.findById(request.id);
    if (!category) throw new EntityNotFound('ServiceCategory', request.id);

    if (request.name !== undefined) {
      const name = request.name.trim();
      if (!name) throw new BadRequest('分类名称不能为空');

      if (name !== category.name) {
        const duplicated =
          await this.serviceCategoryRepository.findByName(name);
        if (duplicated) throw new BadRequest('该分类名称已存在');
      }
      category.name = name;
    }

    if (request.icon !== undefined) category.icon = request.icon;
    if (request.sortOrder !== undefined) category.sortOrder = request.sortOrder;
    category.updatedAt = new Date();

    await this.serviceCategoryRepository.save(category);

    return { category };
  }
}
