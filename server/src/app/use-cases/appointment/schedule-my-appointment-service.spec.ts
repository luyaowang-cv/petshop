import { Pet, PetType, PetGender } from '@app/entities/pet';
import {
  PetshopService,
  ServiceStatus,
} from '@app/entities/petshop-service';
import {
  Appointment,
  AppointmentStatus,
} from '@app/entities/appointment';
import { PetRepository } from '@app/repositories/pet-repository';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { Forbidden } from '../errors/forbidden';
import { EntityNotFound } from '../errors/entity-not-found';
import { BadRequest } from '../errors/bad-request';
import { ScheduleMyAppointmentService } from './schedule-my-appointment-service';

class InMemoryPetRepository extends PetRepository {
  public pets: Pet[] = [];
  async create(pet: Pet): Promise<void> { this.pets.push(pet); }
  async save(pet: Pet): Promise<void> {
    const i = this.pets.findIndex((p) => p.id === pet.id);
    if (i >= 0) this.pets[i] = pet;
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

class InMemoryPetshopServiceRepository extends PetshopServiceRepository {
  public services: PetshopService[] = [];
  async create(s: PetshopService): Promise<void> { this.services.push(s); }
  async save(s: PetshopService): Promise<void> {
    const i = this.services.findIndex((x) => x.id === s.id);
    if (i >= 0) this.services[i] = s;
  }
  async findById(id: string): Promise<PetshopService | null> {
    return this.services.find((s) => s.id === id) ?? null;
  }
  async findMany(): Promise<PetshopService[]> { return this.services; }
  async deleteById(id: string): Promise<void> {
    this.services = this.services.filter((s) => s.id !== id);
  }
}

class InMemoryAppointmentRepository extends AppointmentRepository {
  public appointments: Appointment[] = [];
  async create(appointment: Appointment): Promise<void> {
    this.appointments.push(appointment);
  }
  async save(appointment: Appointment): Promise<void> {
    const i = this.appointments.findIndex((a) => a.id === appointment.id);
    if (i >= 0) this.appointments[i] = appointment;
  }
  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.find((a) => a.id === id) ?? null;
  }
  async findManyByCustomerId(customerId: string): Promise<Appointment[]> {
    return this.appointments.filter((a) => a.pet?.ownerId === customerId);
  }
  async findManyByTimeRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.appointments.filter(
      (a) => a.appointmentTime >= startDate && a.appointmentTime < endDate,
    );
  }
  async findManyPaginated() {
    return { data: this.appointments, meta: { page: 1, lastPage: 1, pageSize: 10, total: this.appointments.length } };
  }
  async delete(id: string): Promise<void> {
    this.appointments = this.appointments.filter((a) => a.id !== id);
  }
  async countByPetId(id: string): Promise<number> {
    return this.appointments.filter((a) => a.petId === id).length;
  }
  async countByCustomerId(_id: string): Promise<number> {
    return 0;
  }
}

function makePet(ownerId: string): Pet {
  return new Pet({ name: '豆豆', age: 2, breed: '泰迪', petType: PetType.DOG, gender: PetGender.MALE, isNeutered: false, ownerId });
}

function makeService(): PetshopService {
  return new PetshopService({ title: '洗护', description: '基础洗护', categoryId: 'cat-grooming', value: 100, status: ServiceStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date() });
}

describe('ScheduleMyAppointmentService', () => {
  let petRepository: InMemoryPetRepository;
  let serviceRepository: InMemoryPetshopServiceRepository;
  let appointmentRepository: InMemoryAppointmentRepository;
  let service: ScheduleMyAppointmentService;

  const futureTime = new Date(Date.now() + 3600 * 1000);

  beforeEach(() => {
    petRepository = new InMemoryPetRepository();
    serviceRepository = new InMemoryPetshopServiceRepository();
    appointmentRepository = new InMemoryAppointmentRepository();
    service = new ScheduleMyAppointmentService(
      appointmentRepository,
      petRepository,
      serviceRepository,
    );
  });

  it('提交自己的宠物预约，状态为 PENDING，保存备注', async () => {
    const pet = makePet('customer-1');
    const svc = makeService();
    await petRepository.create(pet);
    await serviceRepository.create(svc);

    const { appointment } = await service.execute({
      customerId: 'customer-1',
      petId: pet.id,
      serviceId: svc.id,
      appointmentTime: futureTime,
      customerNote: '怕水，请轻一点',
    });

    expect(appointment.status).toBe(AppointmentStatus.PENDING);
    expect(appointment.petId).toBe(pet.id);
    expect(appointment.customerNote).toBe('怕水，请轻一点');
    expect(appointmentRepository.appointments).toHaveLength(1);
  });

  it('不能预约他人宠物（抛 Forbidden）', async () => {
    const pet = makePet('customer-2');
    const svc = makeService();
    await petRepository.create(pet);
    await serviceRepository.create(svc);

    await expect(
      service.execute({
        customerId: 'customer-1',
        petId: pet.id,
        serviceId: svc.id,
        appointmentTime: futureTime,
      }),
    ).rejects.toBeInstanceOf(Forbidden);
  });

  it('宠物不存在抛 EntityNotFound', async () => {
    const svc = makeService();
    await serviceRepository.create(svc);

    await expect(
      service.execute({
        customerId: 'customer-1',
        petId: 'missing-pet',
        serviceId: svc.id,
        appointmentTime: futureTime,
      }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });

  it('预约时间在过去抛 BadRequest', async () => {
    const pet = makePet('customer-1');
    const svc = makeService();
    await petRepository.create(pet);
    await serviceRepository.create(svc);

    await expect(
      service.execute({
        customerId: 'customer-1',
        petId: pet.id,
        serviceId: svc.id,
        appointmentTime: new Date(Date.now() - 3600 * 1000),
      }),
    ).rejects.toBeInstanceOf(BadRequest);
  });

  it('同一时段已有占用中的预约时抛 BadRequest（整店独占）', async () => {
    const pet = makePet('customer-1');
    const svc = makeService();
    await petRepository.create(pet);
    await serviceRepository.create(svc);

    await appointmentRepository.create(new Appointment({
      petId: 'other-pet',
      serviceId: svc.id,
      appointmentTime: futureTime,
      status: AppointmentStatus.CONFIRMED,
    }));

    await expect(
      service.execute({
        customerId: 'customer-1',
        petId: pet.id,
        serviceId: svc.id,
        appointmentTime: futureTime,
      }),
    ).rejects.toBeInstanceOf(BadRequest);
  });

  it('同一时段只有已取消预约时可正常提交', async () => {
    const pet = makePet('customer-1');
    const svc = makeService();
    await petRepository.create(pet);
    await serviceRepository.create(svc);

    await appointmentRepository.create(new Appointment({
      petId: 'other-pet',
      serviceId: svc.id,
      appointmentTime: futureTime,
      status: AppointmentStatus.CANCELED,
    }));

    await expect(
      service.execute({
        customerId: 'customer-1',
        petId: pet.id,
        serviceId: svc.id,
        appointmentTime: futureTime,
      }),
    ).resolves.toBeDefined();
  });
});
