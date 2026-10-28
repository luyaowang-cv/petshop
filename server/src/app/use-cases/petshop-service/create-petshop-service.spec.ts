import {
  PetshopService,
  ServiceCategory,
} from '@app/entities/petshop-service';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
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

describe('CreatePetshopService', () => {
  it('创建服务并保存封面图片', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const service = new CreatePetshopService(repository);

    const { petshopService } = await service.execute({
      title: '洗护',
      description: '基础洗护',
      category: ServiceCategory.GROOMING,
      value: 100,
      duration: 3600,
      imageUrl: '/uploads/cover.png',
    });

    expect(petshopService.imageUrl).toBe('/uploads/cover.png');
    expect(repository.services).toHaveLength(1);
  });

  it('未提供图片时 imageUrl 为 null', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    const service = new CreatePetshopService(repository);

    const { petshopService } = await service.execute({
      title: '洗护',
      description: '基础洗护',
      category: ServiceCategory.GROOMING,
      value: 100,
      duration: 3600,
    });

    expect(petshopService.imageUrl).toBeNull();
  });
});
