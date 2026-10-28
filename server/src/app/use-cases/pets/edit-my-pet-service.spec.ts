import { Pet, PetType, PetGender } from '@app/entities/pet';
import { PetRepository } from '@app/repositories/pet-repository';
import { Forbidden } from '../errors/forbidden';
import { EntityNotFound } from '../errors/entity-not-found';
import { EditMyPetService } from './edit-my-pet-service';

class InMemoryPetRepository extends PetRepository {
  public pets: Pet[] = [];
  public saved: Pet[] = [];

  async create(pet: Pet): Promise<void> {
    this.pets.push(pet);
  }

  async save(pet: Pet): Promise<void> {
    this.saved.push(pet);
    const index = this.pets.findIndex((p) => p.id === pet.id);
    if (index >= 0) this.pets[index] = pet;
  }

  async findById(id: string): Promise<Pet | null> {
    return this.pets.find((p) => p.id === id) ?? null;
  }

  async findManyByOwnerId(ownerId: string): Promise<Pet[]> {
    return this.pets.filter((p) => p.ownerId === ownerId);
  }

  async deleteById(id: string): Promise<void> {
    this.pets = this.pets.filter((p) => p.id !== id);
  }
}

function makePet(ownerId: string): Pet {
  return new Pet({
    name: '豆豆',
    age: 2,
    breed: '泰迪',
    petType: PetType.DOG,
    gender: PetGender.MALE,
    isNeutered: false,
    ownerId,
  });
}

const body = {
  name: '新名字',
  age: 3,
  breed: '比熊',
  petType: PetType.DOG,
  gender: PetGender.MALE,
  isNeutered: true,
  imageUrl: '/uploads/photo.jpg',
};

describe('EditMyPetService', () => {
  let repository: InMemoryPetRepository;
  let service: EditMyPetService;

  beforeEach(() => {
    repository = new InMemoryPetRepository();
    service = new EditMyPetService(repository);
  });

  it('更新自己的宠物并保存照片', async () => {
    const pet = makePet('customer-1');
    await repository.create(pet);

    const { pet: updated } = await service.execute({
      customerId: 'customer-1',
      petId: pet.id,
      body,
    });

    expect(updated.name).toBe('新名字');
    expect(updated.imageUrl).toBe('/uploads/photo.jpg');
    expect(repository.saved).toHaveLength(1);
  });

  it('不能修改他人宠物（抛 Forbidden）', async () => {
    const pet = makePet('customer-2');
    await repository.create(pet);

    await expect(
      service.execute({ customerId: 'customer-1', petId: pet.id, body }),
    ).rejects.toBeInstanceOf(Forbidden);
    expect(repository.saved).toHaveLength(0);
  });

  it('宠物不存在时抛 EntityNotFound', async () => {
    await expect(
      service.execute({
        customerId: 'customer-1',
        petId: 'missing-id',
        body,
      }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
