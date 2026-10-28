import { Pet, PetType, PetGender } from '@app/entities/pet';
import { Appointment } from '@app/entities/appointment';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { ListMyAppointmentsService } from './list-my-appointments-service';

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

describe('ListMyAppointmentsService', () => {
  it('只返回该顾客的预约，含拒绝理由', async () => {
    const repository = new InMemoryAppointmentRepository();
    const future = new Date(Date.now() + 3600 * 1000);

    const mine = new Appointment({
      petId: 'p1',
      serviceId: 's1',
      appointmentTime: future,
      pet: makePet('customer-1'),
      rejectReason: '时间不合适',
    });
    const others = new Appointment({
      petId: 'p2',
      serviceId: 's1',
      appointmentTime: future,
      pet: makePet('customer-2'),
    });
    repository.appointments = [mine, others];

    const service = new ListMyAppointmentsService(repository);
    const { appointments } = await service.execute('customer-1');

    expect(appointments).toHaveLength(1);
    expect(appointments[0].petId).toBe('p1');
    expect(appointments[0].rejectReason).toBe('时间不合适');
  });
});
