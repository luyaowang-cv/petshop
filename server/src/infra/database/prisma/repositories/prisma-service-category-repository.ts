import { Injectable } from '@nestjs/common';
import { ServiceCategory } from '@app/entities/service-category';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';
import { PrismaService } from '../prisma.service';
import { ServiceCategoryMapper } from '../mappers/service-category-mapper';

@Injectable()
export class PrismaServiceCategoryRepository implements ServiceCategoryRepository {
  constructor(private prismaService: PrismaService) {}

  async create(category: ServiceCategory): Promise<void> {
    await this.prismaService.serviceCategory.create({
      data: ServiceCategoryMapper.toPrisma(category),
    });
  }

  async save(category: ServiceCategory): Promise<void> {
    await this.prismaService.serviceCategory.update({
      where: { id: category.id },
      data: ServiceCategoryMapper.toPrisma(category),
    });
  }

  async findById(id: string): Promise<ServiceCategory | null> {
    const category = await this.prismaService.serviceCategory.findUnique({
      where: { id },
    });
    return category ? ServiceCategoryMapper.toDomain(category) : null;
  }

  async findByName(name: string): Promise<ServiceCategory | null> {
    const category = await this.prismaService.serviceCategory.findUnique({
      where: { name },
    });
    return category ? ServiceCategoryMapper.toDomain(category) : null;
  }

  async findMany(): Promise<ServiceCategory[]> {
    const categories = await this.prismaService.serviceCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return categories.map(ServiceCategoryMapper.toDomain);
  }

  async deleteById(id: string): Promise<void> {
    await this.prismaService.serviceCategory.delete({ where: { id } });
  }

  async countServices(categoryId: string): Promise<number> {
    return this.prismaService.petshopService.count({
      where: { categoryId },
    });
  }
}
