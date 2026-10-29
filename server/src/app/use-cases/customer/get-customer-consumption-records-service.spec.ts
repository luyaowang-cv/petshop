import {
  Appointment,
  AppointmentStatus,
} from '@app/entities/appointment';
import {
  ProductOrder,
  ProductOrderStatus,
} from '@app/entities/product-order';
import { Pet, PetGender, PetType } from '@app/entities/pet';
import {
  PetshopService,
  ServiceStatus,
} from '@app/entities/petshop-service';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { ProductOrderRepository } from '@app/repositories/product-order-repository';
import { GetCustomerConsumptionRecordsService } from './get-customer-consumption-records-service';

class InMemoryProductOrderRepository extends ProductOrderRepository {
  public orders: ProductOrder[] = [];
  async create(order: ProductOrder): Promise<void> {
    this.orders.push(order);
  }
  async findById(id: string): Promise<ProductOrder | null> {
    return this.orders.find((o) => o.id === id) ?? null;
  }
  async findMany(filters?: { customerId?: string }) {
    const orders = this.orders.filter(
      (o) => !filters?.customerId || o.customerId === filters.customerId,
    );
    return { orders, total: orders.length };
  }
  async update(): Promise<void> {}
  async delete(): Promise<void> {}
}

class InMemoryAppointmentRepository extends AppointmentRepository {
  public appointments: Appointment[] = [];
  async create(a: Appointment): Promise<void> {
    this.appointments.push(a);
  }
  async save(): Promise<void> {}
  async findById(): Promise<Appointment | null> {
    return null;
  }
  async findManyByCustomerId(): Promise<Appointment[]> {
    return [];
  }
  async findManyByTimeRange(): Promise<Appointment[]> {
    return [];
  }
  async findManyPaginated() {
    return {
      data: this.appointments,
      meta: {
        page: 1,
        lastPage: 1,
        pageSize: 10,
        total: this.appointments.length,
      },
    };
  }
  async delete(): Promise<void> {}
  async countByPetId(): Promise<number> {
    return 0;
  }
  async countByCustomerId(): Promise<number> {
    return 0;
  }
}

function makeOrder(
  customerId: string,
  status: ProductOrderStatus,
  totalAmount = 5000,
): ProductOrder {
  return new ProductOrder({
    customerId,
    totalAmount,
    status,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function makeService(): PetshopService {
  return new PetshopService({
    title: '基础洗护',
    description: '洗护服务',
    value: 10000,
    status: ServiceStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
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

describe('GetCustomerConsumptionRecordsService', () => {
  let orderRepository: InMemoryProductOrderRepository;
  let appointmentRepository: InMemoryAppointmentRepository;
  let service: GetCustomerConsumptionRecordsService;

  beforeEach(() => {
    orderRepository = new InMemoryProductOrderRepository();
    appointmentRepository = new InMemoryAppointmentRepository();
    service = new GetCustomerConsumptionRecordsService(
      orderRepository,
      appointmentRepository,
    );
  });

  it('收银台的 CONFIRMED 订单计入消费记录', async () => {
    await orderRepository.create(
      makeOrder('c1', ProductOrderStatus.CONFIRMED),
    );

    const { records, total } = await service.execute({ customerId: 'c1' });

    expect(total).toBe(1);
    expect(records[0].type).toBe('PRODUCT');
    expect(records[0].amount).toBe(5000);
  });

  it('订单页「完成」的 COMPLETED 订单也计入', async () => {
    await orderRepository.create(
      makeOrder('c1', ProductOrderStatus.COMPLETED),
    );

    const { records } = await service.execute({ customerId: 'c1' });

    expect(records).toHaveLength(1);
  });

  it('待处理 / 已取消的订单不计入', async () => {
    await orderRepository.create(makeOrder('c1', ProductOrderStatus.PENDING));
    await orderRepository.create(makeOrder('c1', ProductOrderStatus.CANCELED));

    const { records } = await service.execute({ customerId: 'c1' });

    expect(records).toHaveLength(0);
  });

  it('已完成的服务预约计入，且只算该客户的宠物', async () => {
    const mine = new Appointment({
      petId: 'p1',
      serviceId: 's1',
      appointmentTime: new Date(),
      status: AppointmentStatus.COMPLETED,
      pet: makePet('c1'),
      service: makeService(),
    });
    const others = new Appointment({
      petId: 'p2',
      serviceId: 's1',
      appointmentTime: new Date(),
      status: AppointmentStatus.COMPLETED,
      pet: makePet('c2'),
      service: makeService(),
    });
    await appointmentRepository.create(mine);
    await appointmentRepository.create(others);

    const { records } = await service.execute({ customerId: 'c1' });

    expect(records).toHaveLength(1);
    expect(records[0].type).toBe('SERVICE');
    expect(records[0].items[0]).toContain('基础洗护');
  });
});
