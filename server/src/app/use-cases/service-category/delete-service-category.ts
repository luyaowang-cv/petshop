import { Injectable } from '@nestjs/common';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { BadRequest } from '../errors/bad-request';

@Injectable()
export class DeleteServiceCategory {
  constructor(private serviceCategoryRepository: ServiceCategoryRepository) {}

  async execute(id: string) {
    const category = await this.serviceCategoryRepository.findById(id);
    if (!category) throw new EntityNotFound('ServiceCategory', id);

    const count = await this.serviceCategoryRepository.countServices(id);
    if (count > 0) {
      throw new BadRequest(
        `该分类下还有 ${count} 个项目，请先移动或删除这些项目`,
      );
    }

    await this.serviceCategoryRepository.deleteById(id);
  }
}
