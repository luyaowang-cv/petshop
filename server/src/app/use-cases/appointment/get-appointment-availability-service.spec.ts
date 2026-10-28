import { Appointment, AppointmentStatus } from '@app/entities/appointment';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { GetAppointmentAvailabilityService } from './get-appointment-availability-service';

class InMemoryAppointmentRepository extends AppointmentRepository {
  public appointments: Appointment[] = [];
  async create(a: Appointment): Promise<void> { this.appointments.push(a); }
  async save(a: Appointment): Promise<void> {
    const i = this.appointments.findIndex((x) => x.id === a.id);
    if (i >= 0) this.appointments[i] = a;
  }
  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.find((a) => a.id === id) ?? null;
  }
  async findManyByCustomerId(_id: string): Promise<Appointment[]> { return []; }
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
  async countByCustomerId(_id: string): Promise<number> { return 0; }
}

describe('GetAppointmentAvailabilityService', () => {
  let repository: InMemoryAppointmentRepository;
  let service: GetAppointmentAvailabilityService;

  const start = new Date('2026-10-29T00:00:00.000Z');
  const end = new Date('2026-10-30T00:00:00.000Z');

  beforeEach(() => {
    repository = new InMemoryAppointmentRepository();
    service = new GetAppointmentAvailabilityService(repository);
  });

  it('返回占用中预约的时间点', async () => {
    const t = new Date('2026-10-29T01:00:00.000Z');
    await repository.create(new Appointment({
      petId: 'p1',
      serviceId: 's1',
      appointmentTime: t,
      status: AppointmentStatus.PENDING,
    }));

    const { bookedTimes } = await service.execute({ startDate: start, endDate: end });

    expect(bookedTimes).toEqual([t.toISOString()]);
  });

  it('已取消/拒绝的预约不占用时段', async () => {
    await repository.create(new Appointment({
      petId: 'p1',
      serviceId: 's1',
      appointmentTime: new Date('2026-10-29T01:00:00.000Z'),
      status: AppointmentStatus.CANCELED,
    }));
    await repository.create(new Appointment({
      petId: 'p2',
      serviceId: 's1',
      appointmentTime: new Date('2026-10-29T02:00:00.000Z'),
      status: AppointmentStatus.REJECTED,
    }));

    const { bookedTimes } = await service.execute({ startDate: start, endDate: end });

    expect(bookedTimes).toEqual([]);
  });

  it('只返回范围内的预约', async () => {
    await repository.create(new Appointment({
      petId: 'p1',
      serviceId: 's1',
      appointmentTime: new Date('2026-10-30T01:00:00.000Z'),
      status: AppointmentStatus.PENDING,
    }));

    const { bookedTimes } = await service.execute({ startDate: start, endDate: end });

    expect(bookedTimes).toEqual([]);
  });
});
