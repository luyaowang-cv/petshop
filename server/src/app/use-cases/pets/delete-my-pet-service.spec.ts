import { Pet, PetType, PetGender } from '@app/entities/pet';
import { Appointment } from '@app/entities/appointment';
import { PetRepository } from '@app/repositories/pet-repository';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { Forbidden } from '../errors/forbidden';
import { EntityNotFound } from '../errors/entity-not-found';
import { InvalidDeleteOperation } from '../errors/invalid-delete-operation';
import { DeleteMyPetService } from './delete-my-pet-service';

class InMemoryPetRepository extends PetRepository {
  public pets: Pet[] = [];

  async create(pet: Pet): Promise<void> {
    this.pets.push(pet);
  }

  async save(pet: Pet): Promise<void> {
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

class InMemoryAppointmentRepository extends AppointmentRepository {
  public appointmentsByPet = 0;

  async create(_appointment: Appointment): Promise<void> {}

  async save(_appointment: Appointment): Promise<void> {}

  async findById(_id: string): Promise<Appointment | null> {
    return null;
  }

  async findManyByCustomerId(_customerId: string): Promise<Appointment[]> {
    return [];
  }

  async findManyPaginated() {
    return { data: [], meta: { page: 1, lastPage: 0, pageSize: 10, total: 0 } };
  }

  async delete(_id: string): Promise<void> {}

  async countByPetId(_id: string): Promise<number> {
    return this.appointmentsByPet;
  }

  async countByCustomerId(_id: string): Promise<number> {
    return 0;
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

describe('DeleteMyPetService', () => {
  let repository: InMemoryPetRepository;
  let appointmentRepository: InMemoryAppointmentRepository;
  let service: DeleteMyPetService;

  beforeEach(() => {
    repository = new InMemoryPetRepository();
    appointmentRepository = new InMemoryAppointmentRepository();
    service = new DeleteMyPetService(repository, appointmentRepository);
  });

  it('删除自己的宠物（无预约）', async () => {
    const pet = makePet('customer-1');
    await repository.create(pet);

    await service.execute({ customerId: 'customer-1', petId: pet.id });

    expect(repository.pets).toHaveLength(0);
  });

  it('有预约历史时禁止删除', async () => {
    const pet = makePet('customer-1');
    await repository.create(pet);
    appointmentRepository.appointmentsByPet = 2;

    await expect(
      service.execute({ customerId: 'customer-1', petId: pet.id }),
    ).rejects.toBeInstanceOf(InvalidDeleteOperation);
    expect(repository.pets).toHaveLength(1);
  });

  it('不能删除他人宠物（抛 Forbidden）', async () => {
    const pet = makePet('customer-2');
    await repository.create(pet);

    await expect(
      service.execute({ customerId: 'customer-1', petId: pet.id }),
    ).rejects.toBeInstanceOf(Forbidden);
    expect(repository.pets).toHaveLength(1);
  });

  it('宠物不存在时抛 EntityNotFound', async () => {
    await expect(
      service.execute({ customerId: 'customer-1', petId: 'missing-id' }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
