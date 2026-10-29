import {
  Appointment,
  AppointmentStatus,
} from '@app/entities/appointment';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { Customer } from '@app/entities/customer';
import { Pet, PetType, PetGender } from '@app/entities/pet';
import { PetshopService, ServiceStatus } from '@app/entities/petshop-service';
import {
  AppointmentReminderSubscriptionMessage,
  SubscriptionMessageClient,
} from '@app/providers/subscription-message-client';
import { EntityNotFound } from '../errors/entity-not-found';
import { SendAppointmentReminderService } from './send-appointment-reminder-service';

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
  async findManyByTimeRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return this.appointments.filter(
      (a) => a.appointmentTime >= startDate && a.appointmentTime < endDate,
    );
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
  public reminderMessages: AppointmentReminderSubscriptionMessage[] = [];
  async sendReviewResult(): Promise<void> {}
  async sendAppointmentReminder(m: AppointmentReminderSubscriptionMessage): Promise<void> {
    this.reminderMessages.push(m);
  }
}

const OWNER_ID = 'customer-1';
const TIME = new Date(Date.now() + 3600 * 1000);

function makeAppointment(pet: Pet, service: PetshopService): Appointment {
  return new Appointment({
    petId: pet.id,
    serviceId: service.id,
    appointmentTime: TIME,
    status: AppointmentStatus.CONFIRMED,
    pet,
    service,
  });
}

describe('SendAppointmentReminderService', () => {
  let appointmentRepository: InMemoryAppointmentRepository;
  let customerRepository: InMemoryCustomerRepository;
  let messageClient: MockSubscriptionMessageClient;
  let service: SendAppointmentReminderService;

  beforeEach(() => {
    appointmentRepository = new InMemoryAppointmentRepository();
    customerRepository = new InMemoryCustomerRepository();
    messageClient = new MockSubscriptionMessageClient();
    service = new SendAppointmentReminderService(
      appointmentRepository,
      customerRepository,
      messageClient,
    );
  });

  it('发送预约提醒，携带 openid/时间/服务名', async () => {
    const pet = new Pet({
      name: '豆豆', age: 3, breed: '金毛', petType: PetType.DOG,
      gender: PetGender.MALE, isNeutered: false, ownerId: OWNER_ID,
    });
    const serviceEntity = new PetshopService({
      title: '洗澡',
      description: '基础洗护',
      value: 5000,
      categoryId: 'cat-grooming',
      duration: 60,
      status: ServiceStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const customer = new Customer(
      { name: '微信用户', phone: '13800000000', openid: 'openid-1', pets: [] },
      OWNER_ID,
    );
    await customerRepository.create(customer);
    const appt = makeAppointment(pet, serviceEntity);
    await appointmentRepository.create(appt);

    const { sent } = await service.execute({ appointmentId: appt.id });

    expect(sent).toBe(true);
    expect(messageClient.reminderMessages).toHaveLength(1);
    expect(messageClient.reminderMessages[0]).toMatchObject({
      openid: 'openid-1',
      appointmentId: appt.id,
      serviceTitle: '洗澡',
    });
    expect(messageClient.reminderMessages[0].appointmentTime).toEqual(TIME);
  });

  it('顾客无 openid → 不发送，sent=false', async () => {
    const pet = new Pet({
      name: '豆豆', age: 3, breed: '金毛', petType: PetType.DOG,
      gender: PetGender.MALE, isNeutered: false, ownerId: OWNER_ID,
    });
    const serviceEntity = new PetshopService({
      title: '洗澡',
      description: '基础洗护',
      value: 5000,
      categoryId: 'cat-grooming',
      duration: 60,
      status: ServiceStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const customer = new Customer(
      { name: '微信用户', phone: '13800000000', pets: [] },
      OWNER_ID,
    );
    await customerRepository.create(customer);
    const appt = makeAppointment(pet, serviceEntity);
    await appointmentRepository.create(appt);

    const { sent } = await service.execute({ appointmentId: appt.id });

    expect(sent).toBe(false);
    expect(messageClient.reminderMessages).toHaveLength(0);
  });

  it('预约不存在 → EntityNotFound', async () => {
    await expect(
      service.execute({ appointmentId: 'missing' }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
