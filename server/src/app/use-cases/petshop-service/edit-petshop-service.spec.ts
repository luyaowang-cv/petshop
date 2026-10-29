import { PetshopService, ServiceStatus } from '@app/entities/petshop-service';
import { ServiceCategory } from '@app/entities/service-category';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { ServiceCategoryRepository } from '@app/repositories/service-category-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { EditPetshopService } from './edit-petshop-service';

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

function makeCategory(name: string): ServiceCategory {
  return new ServiceCategory({ name });
}

function makeService(category: ServiceCategory): PetshopService {
  return new PetshopService({
    title: '洗护',
    description: '基础洗护',
    categoryId: category.id,
    category,
    value: 100,
    status: ServiceStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('EditPetshopService', () => {
  it('更新服务并保存封面图片', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const categoryRepository = new InMemoryServiceCategoryRepository();
    const grooming = makeCategory('洗护');
    await categoryRepository.create(grooming);

    const service = new EditPetshopService(repository, categoryRepository);
    const existing = makeService(grooming);
    await repository.create(existing);

    const { petshopService } = await service.execute({
      id: existing.id,
      body: {
        title: '洗护2',
        description: '新描述',
        categoryId: grooming.id,
        value: 200,
        duration: 3600,
        imageUrl: '/uploads/cover.png',
      },
    });

    expect(petshopService.imageUrl).toBe('/uploads/cover.png');
    expect(petshopService.value).toBe(200);
  });

  it('可以改到新建的分类下（如美容）', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const categoryRepository = new InMemoryServiceCategoryRepository();
    const grooming = makeCategory('洗护');
    const beauty = makeCategory('美容');
    await categoryRepository.create(grooming);
    await categoryRepository.create(beauty);

    const service = new EditPetshopService(repository, categoryRepository);
    const existing = makeService(grooming);
    await repository.create(existing);

    const { petshopService } = await service.execute({
      id: existing.id,
      body: {
        title: '洗护',
        description: '基础洗护',
        categoryId: beauty.id,
        value: 100,
        duration: 3600,
      },
    });

    expect(petshopService.categoryId).toBe(beauty.id);
    expect(petshopService.categoryName).toBe('美容');
  });

  it('服务不存在时抛 EntityNotFound', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const categoryRepository = new InMemoryServiceCategoryRepository();
    const service = new EditPetshopService(repository, categoryRepository);

    await expect(
      service.execute({
        id: 'missing-id',
        body: {
          title: 'x',
          description: 'y',
          categoryId: 'any',
          value: 100,
          duration: 3600,
        },
      }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
