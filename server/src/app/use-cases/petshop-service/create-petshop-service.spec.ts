import { PetshopService } from '@app/entities/petshop-service';
import { ServiceCategory } from '@app/entities/service-category';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { CreatePetshopService } from './create-petshop-service';

class InMemoryPetshopServiceRepository extends PetshopServiceRepository {
  public services: PetshopService[] = [];

  async create(s: PetshopService): Promise<void> {
    this.services.push(s);
  }

  async save(s: PetshopService): Promise<void> {
    const index = this.services.findIndex((x) => x.id === s.id);
    if (index >= 0) this.services[index] = s;
  }

  async findById(id: string): Promise<PetshopService | null> {
    return this.services.find((s) => s.id === id) ?? null;
  }

  async findMany(): Promise<PetshopService[]> {
    return this.services;
  }

  async deleteById(id: string): Promise<void> {
    this.services = this.services.filter((s) => s.id !== id);
  }
}

class InMemoryServiceCategoryRepository extends ServiceCategoryRepository {
  public categories: ServiceCategory[] = [];
  async create(c: ServiceCategory): Promise<void> { this.categories.push(c); }
  async save(c: ServiceCategory): Promise<void> {
    const i = this.categories.findIndex((x) => x.id === c.id);
    if (i >= 0) this.categories[i] = c;
  }
  async findById(id: string): Promise<ServiceCategory | null> {
    return this.categories.find((c) => c.id === id) ?? null;
  }
  async findByName(name: string): Promise<ServiceCategory | null> {
    return this.categories.find((c) => c.name === name) ?? null;
  }
  async findMany(): Promise<ServiceCategory[]> { return this.categories; }
  async deleteById(id: string): Promise<void> {
    this.categories = this.categories.filter((c) => c.id !== id);
  }
  async countServices(categoryId: string): Promise<number> {
    return 0;
  }
}

function makeGroomingCategory(): ServiceCategory {
  return new ServiceCategory({ name: '洗护', icon: '🛁', sortOrder: 1 });
}

describe('CreatePetshopService', () => {
  it('创建服务并保存封面图片', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const categoryRepository = new InMemoryServiceCategoryRepository();
    const category = makeGroomingCategory();
    await categoryRepository.create(category);

    const service = new CreatePetshopService(repository, categoryRepository);

    const { petshopService } = await service.execute({
      title: '洗护',
      description: '基础洗护',
      categoryId: category.id,
      value: 100,
      duration: 3600,
      imageUrl: '/uploads/cover.png',
    });

    expect(petshopService.imageUrl).toBe('/uploads/cover.png');
    expect(petshopService.categoryName).toBe('洗护');
    expect(repository.services).toHaveLength(1);
  });

  it('未提供图片时 imageUrl 为 null', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const categoryRepository = new InMemoryServiceCategoryRepository();
    const category = makeGroomingCategory();
    await categoryRepository.create(category);

    const service = new CreatePetshopService(repository, categoryRepository);

    const { petshopService } = await service.execute({
      title: '洗护',
      description: '基础洗护',
      categoryId: category.id,
      value: 100,
      duration: 3600,
    });

    expect(petshopService.imageUrl).toBeNull();
  });

  it('分类不存在时抛 EntityNotFound', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const categoryRepository = new InMemoryServiceCategoryRepository();
    const service = new CreatePetshopService(repository, categoryRepository);

    await expect(
      service.execute({
        title: '洗护',
        description: '基础洗护',
        categoryId: 'missing-category',
        value: 100,
        duration: 3600,
      }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
