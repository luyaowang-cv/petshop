import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateServiceCategory } from '@app/use-cases/service-category/create-service-category';
import { ListServiceCategories } from '@app/use-cases/service-category/list-service-categories';
import { EditServiceCategory } from '@app/use-cases/service-category/edit-service-category';
import { DeleteServiceCategory } from '@app/use-cases/service-category/delete-service-category';
import { ServiceCategoryViewModel } from '../view-models/service-category-view-model';
import { CreateServiceCategoryBody } from './dtos/create-service-category-body';
import { UpdateServiceCategoryBody } from './dtos/update-service-category-body';

@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(
    private listServiceCategories: ListServiceCategories,
    private createServiceCategory: CreateServiceCategory,
    private editServiceCategory: EditServiceCategory,
    private deleteServiceCategory: DeleteServiceCategory,
  ) {}

  @Get()
  async list() {
    const { categories } = await this.listServiceCategories.execute();
    return { categories: categories.map(ServiceCategoryViewModel.toHTTP) };
  }

  @Post()
  async create(@Body() body: CreateServiceCategoryBody) {
    const { category } = await this.createServiceCategory.execute(body);
    return { category: ServiceCategoryViewModel.toHTTP(category) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateServiceCategoryBody) {
    const { category } = await this.editServiceCategory.execute({ id, ...body });
    return { category: ServiceCategoryViewModel.toHTTP(category) };
  }

  @Delete(':id')
  async destroy(@Param('id') id: string) {
    await this.deleteServiceCategory.execute(id);
  }
}
