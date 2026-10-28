import {
  Appointment,
  AppointmentStatus,
} from '@app/entities/appointment';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { Customer } from '@app/entities/customer';
import { Pet, PetType, PetGender } from '@app/entities/pet';
import {
  ReviewResultSubscriptionMessage,
  SubscriptionMessageClient,
} from '@app/providers/subscription-message-client';
import { EntityNotFound } from '../errors/entity-not-found';
import { BadRequest } from '../errors/bad-request';
import { ReviewAppointmentService } from './review-appointment-service';

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

class InMemoryCustomerRepository extends CustomerRepository {
  public customers: Customer[] = [];
  async findById(id: string): Promise<Customer | null> {
    return this.customers.find((c) => c.id === id) ?? null;
  }
  async findByOpenid(openid: string): Promise<Customer | null> {
    return this.customers.find((c) => c.openid === openid) ?? null;
  }
  async findByPhone(phone: string): Promise<Customer | null> {
    return this.customers.find((c) => c.phone === phone) ?? null;
  }
  async findMany(): Promise<Customer[]> { return this.customers; }
  async create(c: Customer): Promise<void> { this.customers.push(c); }
  async save(c: Customer): Promise<void> {
    const i = this.customers.findIndex((x) => x.id === c.id);
    if (i >= 0) this.customers[i] = c;
  }
  async deleteById(id: string): Promise<void> {
    this.customers = this.customers.filter((c) => c.id !== id);
  }
}

class MockSubscriptionMessageClient extends SubscriptionMessageClient {
  public reviewResultMessages: ReviewResultSubscriptionMessage[] = [];
  async sendReviewResult(m: ReviewResultSubscriptionMessage): Promise<void> {
    this.reviewResultMessages.push(m);
  }
  async sendAppointmentReminder(): Promise<void> {}
}

const OWNER_ID = 'customer-1';

function makePet(ownerId: string = OWNER_ID): Pet {
  return new Pet({
    name: '豆豆',
    age: 3,
    breed: '金毛',
    petType: PetType.DOG,
    gender: PetGender.MALE,
    isNeutered: false,
    ownerId,
  });
}

function makeAppointment(
  status: AppointmentStatus = AppointmentStatus.PENDING,
  pet: Pet = makePet(),
): Appointment {
  return new Appointment({
    petId: pet.id,
    serviceId: 's1',
    appointmentTime: new Date(Date.now() + 3600 * 1000),
    status,
    pet,
  });
}

function makeCustomer(): Customer {
  return new Customer(
    { name: '微信用户', phone: '13800000000', openid: 'openid-1', pets: [] },
    OWNER_ID,
  );
}

describe('ReviewAppointmentService', () => {
  let appointmentRepository: InMemoryAppointmentRepository;
  let customerRepository: InMemoryCustomerRepository;
  let messageClient: MockSubscriptionMessageClient;
  let service: ReviewAppointmentService;

  beforeEach(() => {
    appointmentRepository = new InMemoryAppointmentRepository();
    customerRepository = new InMemoryCustomerRepository();
    messageClient = new MockSubscriptionMessageClient();
    service = new ReviewAppointmentService(
      appointmentRepository,
      customerRepository,
      messageClient,
    );
  });

  it('审核通过 → CONFIRMED，并发送通过订阅消息', async () => {
    await customerRepository.create(makeCustomer());
    const appt = makeAppointment(AppointmentStatus.PENDING);
    await appointmentRepository.create(appt);

    const { appointment } = await service.execute({
      appointmentId: appt.id,
      action: 'CONFIRM',
    });

    expect(appointment.status).toBe(AppointmentStatus.CONFIRMED);
    expect(messageClient.reviewResultMessages).toHaveLength(1);
    expect(messageClient.reviewResultMessages[0]).toMatchObject({
      openid: 'openid-1',
      appointmentId: appt.id,
      action: 'CONFIRM',
    });
  });

  it('审核拒绝且带理由 → REJECTED，理由保存，并发送含理由的订阅消息', async () => {
    await customerRepository.create(makeCustomer());
    const appt = makeAppointment(AppointmentStatus.PENDING);
    await appointmentRepository.create(appt);

    const { appointment } = await service.execute({
      appointmentId: appt.id,
      action: 'REJECT',
      rejectReason: '当天已约满',
    });

    expect(appointment.status).toBe(AppointmentStatus.REJECTED);
    expect(appointment.rejectReason).toBe('当天已约满');
    expect(messageClient.reviewResultMessages).toHaveLength(1);
    expect(messageClient.reviewResultMessages[0]).toMatchObject({
      action: 'REJECT',
      rejectReason: '当天已约满',
    });
  });

  it('拒绝但未填理由 → BadRequest，不发送消息', async () => {
    const appt = makeAppointment(AppointmentStatus.PENDING);
    await appointmentRepository.create(appt);

    await expect(
      service.execute({ appointmentId: appt.id, action: 'REJECT' }),
    ).rejects.toBeInstanceOf(BadRequest);

    await expect(
      service.execute({ appointmentId: appt.id, action: 'REJECT', rejectReason: '   ' }),
    ).rejects.toBeInstanceOf(BadRequest);

    expect(messageClient.reviewResultMessages).toHaveLength(0);
  });

  it('非 PENDING 状态不可审核 → BadRequest', async () => {
    const appt = makeAppointment(AppointmentStatus.CONFIRMED);
    await appointmentRepository.create(appt);

    await expect(
      service.execute({ appointmentId: appt.id, action: 'CONFIRM' }),
    ).rejects.toBeInstanceOf(BadRequest);
  });

  it('预约不存在 → EntityNotFound', async () => {
    await expect(
      service.execute({ appointmentId: 'missing', action: 'CONFIRM' }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
