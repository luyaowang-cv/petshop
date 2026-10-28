import { Customer } from '@app/entities/customer';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { UpdateMyProfileService } from './update-my-profile-service';

class InMemoryCustomerRepository extends CustomerRepository {
  public customers: Customer[] = [];
  async findById(id: string): Promise<Customer | null> {
    return this.customers.find((c) => c.id === id) ?? null;
  }
  async findByOpenid(_openid: string): Promise<Customer | null> { return null; }
  async findByPhone(_phone: string): Promise<Customer | null> { return null; }
  async findMany(): Promise<Customer[]> { return this.customers; }
  async create(customer: Customer): Promise<void> { this.customers.push(customer); }
  async save(customer: Customer): Promise<void> {
    const i = this.customers.findIndex((c) => c.id === customer.id);
    if (i >= 0) this.customers[i] = customer;
  }
  async deleteById(id: string): Promise<void> {
    this.customers = this.customers.filter((c) => c.id !== id);
  }
}

function makeCustomer(): Customer {
  return new Customer({
    name: '微信用户',
    phone: '13800000000',
    avatarUrl: null,
    pets: [],
  });
}

describe('UpdateMyProfileService', () => {
  let repository: InMemoryCustomerRepository;
  let service: UpdateMyProfileService;

  beforeEach(() => {
    repository = new InMemoryCustomerRepository();
    service = new UpdateMyProfileService(repository);
  });

  it('更新自己的头像', async () => {
    const customer = makeCustomer();
    await repository.create(customer);

    const { customer: updated } = await service.execute({
      customerId: customer.id,
      avatarUrl: 'https://example.com/avatar.png',
    });

    expect(updated.avatarUrl).toBe('https://example.com/avatar.png');
    expect(repository.customers[0].avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('更新自己的昵称', async () => {
    const customer = makeCustomer();
    await repository.create(customer);

    const { customer: updated } = await service.execute({
      customerId: customer.id,
      name: '小爱',
    });

    expect(updated.name).toBe('小爱');
  });

  it('未传字段保持原值', async () => {
    const customer = makeCustomer();
    customer.name = '原昵称';
    await repository.create(customer);

    const { customer: updated } = await service.execute({
      customerId: customer.id,
      avatarUrl: 'https://example.com/avatar.png',
    });

    expect(updated.name).toBe('原昵称');
  });

  it('顾客不存在抛 EntityNotFound', async () => {
    await expect(
      service.execute({ customerId: 'missing', name: 'x' }),
    ).rejects.toBeInstanceOf(EntityNotFound);
  });
});
