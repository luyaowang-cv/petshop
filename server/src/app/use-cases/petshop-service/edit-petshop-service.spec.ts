import {
  PetshopService,
  ServiceCategory,
  ServiceStatus,
} from '@app/entities/petshop-service';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
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

function makeService(): PetshopService {
  return new PetshopService({
    title: '洗护',
    description: '基础洗护',
    category: ServiceCategory.GROOMING,
    value: 100,
    status: ServiceStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('EditPetshopService', () => {
  it('更新服务并保存封面图片', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const service = new EditPetshopService(repository);
    const existing = makeService();
    await repository.create(existing);

    const { petshopService } = await service.execute({
      id: existing.id,
      body: {
        title: '洗护2',
        description: '新描述',
        category: ServiceCategory.GROOMING,
        value: 200,
        duration: 3600,
        imageUrl: '/uploads/cover.png',
      },
    });

    expect(petshopService.imageUrl).toBe('/uploads/cover.png');
    expect(petshopService.value).toBe(200);
  });

  it('服务不存在时抛 EntityNotFound', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const service = new EditPetshopService(repository);

    await expect(
      service.execute({
        id: 'missing-id',
        body: {
          title: 'x',
          description: 'y',
          category: ServiceCategory.GROOMING,
          value: 100,
          duration: 3600,
        },
      }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
