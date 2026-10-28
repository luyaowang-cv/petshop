import {
  PetshopService,
  ServiceCategory,
  ServiceStatus,
} from '@app/entities/petshop-service';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { ListActivePetshopServices } from './list-active-petshop-services';

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

function makeService(status: ServiceStatus): PetshopService {
  return new PetshopService({
    title: '洗护',
    description: '基础洗护',
    category: ServiceCategory.GROOMING,
    value: 100,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('ListActivePetshopServices', () => {
  it('只返回 ACTIVE 服务，过滤 INACTIVE', async () => {
    const repository = new InMemoryPetshopServiceRepository();
    repository.services = [
      makeService(ServiceStatus.ACTIVE),
      makeService(ServiceStatus.INACTIVE),
      makeService(ServiceStatus.ACTIVE),
    ];

    const service = new ListActivePetshopServices(repository);
    const { petshopServices } = await service.execute();

    expect(petshopServices).toHaveLength(2);
    expect(
      petshopServices.every((s) => s.status === ServiceStatus.ACTIVE),
    ).toBe(true);
  });
});
