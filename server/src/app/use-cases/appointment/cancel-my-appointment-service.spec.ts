import { Pet, PetType, PetGender } from '@app/entities/pet';
import {
  Appointment,
  AppointmentStatus,
} from '@app/entities/appointment';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { Forbidden } from '../errors/forbidden';
import { EntityNotFound } from '../errors/entity-not-found';
import { BadRequest } from '../errors/bad-request';
import { CancelMyAppointmentService } from './cancel-my-appointment-service';

class InMemoryAppointmentRepository extends AppointmentRepository {
  public appointments: Appointment[] = [];
  public saved: Appointment[] = [];
  async create(a: Appointment): Promise<void> { this.appointments.push(a); }
  async save(a: Appointment): Promise<void> {
    this.saved.push(a);
    const i = this.appointments.findIndex((x) => x.id === a.id);
    if (i >= 0) this.appointments[i] = a;
  }
  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.find((a) => a.id === id) ?? null;
  }
  async findManyByCustomerId(customerId: string): Promise<Appointment[]> {
    return this.appointments.filter((a) => a.pet?.ownerId === customerId);
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
  async findManyByTimeRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.appointments.filter(
      (a) => a.appointmentTime >= startDate && a.appointmentTime < endDate,
    );
  }
  async countByCustomerId(_id: string): Promise<number> { return 0; }
}

function makePet(ownerId: string): Pet {
  return new Pet({ name: '豆豆', age: 2, breed: '泰迪', petType: PetType.DOG, gender: PetGender.MALE, isNeutered: false, ownerId });
}

function makeAppointment(status: AppointmentStatus, ownerId: string): Appointment {
  return new Appointment({
    petId: 'p1',
    serviceId: 's1',
    appointmentTime: new Date(Date.now() + 3600 * 1000),
    status,
    pet: makePet(ownerId),
  });
}

describe('CancelMyAppointmentService', () => {
  let repository: InMemoryAppointmentRepository;
  let service: CancelMyAppointmentService;

  beforeEach(() => {
    repository = new InMemoryAppointmentRepository();
    service = new CancelMyAppointmentService(repository);
  });

  it('可取消自己的 PENDING 预约', async () => {
    const appt = makeAppointment(AppointmentStatus.PENDING, 'customer-1');
    await repository.create(appt);

    const { appointment } = await service.execute({
      customerId: 'customer-1',
      appointmentId: appt.id,
    });

    expect(appointment.status).toBe(AppointmentStatus.CANCELED);
  });

  it('可取消自己的 CONFIRMED 预约', async () => {
    const appt = makeAppointment(AppointmentStatus.CONFIRMED, 'customer-1');
    await repository.create(appt);

    const { appointment } = await service.execute({
      customerId: 'customer-1',
      appointmentId: appt.id,
    });

    expect(appointment.status).toBe(AppointmentStatus.CANCELED);
  });

  it('终态预约不可取消（抛 BadRequest）', async () => {
    for (const status of [
      AppointmentStatus.REJECTED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELED,
    ]) {
      const appt = makeAppointment(status, 'customer-1');
      await repository.create(appt);

      await expect(
        service.execute({ customerId: 'customer-1', appointmentId: appt.id }),
      ).rejects.toBeInstanceOf(BadRequest);
    }
  });

  it('不能取消他人预约（抛 Forbidden）', async () => {
    const appt = makeAppointment(AppointmentStatus.PENDING, 'customer-2');
    await repository.create(appt);

    await expect(
      service.execute({ customerId: 'customer-1', appointmentId: appt.id }),
    ).rejects.toBeInstanceOf(Forbidden);
  });

  it('预约不存在抛 EntityNotFound', async () => {
    await expect(
      service.execute({ customerId: 'customer-1', appointmentId: 'missing' }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
