import { Pet, PetType, PetGender } from '@app/entities/pet';
import { PetRepository } from '@app/repositories/pet-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { EditPetService } from './edit-pet-service';

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

function makePet(): Pet {
  return new Pet({
    name: '豆豆',
    age: 2,
    breed: '泰迪',
    petType: PetType.DOG,
    gender: PetGender.MALE,
    isNeutered: false,
    ownerId: 'owner-1',
  });
}

describe('EditPetService', () => {
  let repository: InMemoryPetRepository;
  let service: EditPetService;

  beforeEach(() => {
    repository = new InMemoryPetRepository();
    service = new EditPetService(repository);
  });

  it('更新宠物信息并保存照片', async () => {
    const pet = makePet();
    await repository.create(pet);

    const { pet: updated } = await service.execute({
      id: pet.id,
      body: {
        name: '新名字',
        age: 3,
        breed: '比熊',
        petType: PetType.DOG,
        gender: PetGender.MALE,
        isNeutered: true,
        imageUrl: '/uploads/photo.jpg',
      },
    });

    expect(updated.name).toBe('新名字');
    expect(updated.imageUrl).toBe('/uploads/photo.jpg');
    expect(repository.saved).toHaveLength(1);
  });

  it('宠物不存在时抛 EntityNotFound', async () => {
    await expect(
      service.execute({
        id: 'missing-id',
        body: {
          name: 'x',
          age: 1,
          breed: 'y',
          petType: PetType.DOG,
          gender: PetGender.MALE,
          isNeutered: false,
        },
      }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
