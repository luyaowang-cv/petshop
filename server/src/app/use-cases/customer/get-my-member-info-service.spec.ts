import { CustomerRepository } from '@app/repositories/customer-repository';
import { Customer, MemberLevel } from '@app/entities/customer';
import { EntityNotFound } from '../errors/entity-not-found';
import { GetMyMemberInfoService } from './get-my-member-info-service';

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

describe('GetMyMemberInfoService', () => {
  let repository: InMemoryCustomerRepository;
  let service: GetMyMemberInfoService;

  beforeEach(() => {
    repository = new InMemoryCustomerRepository();
    service = new GetMyMemberInfoService(repository);
  });

  it('返回当前顾客的等级/余额/积分', async () => {
    const customer = new Customer(
      {
        name: '微信用户',
        phone: '13800000000',
        openid: 'openid-1',
        avatarUrl: 'https://example.com/avatar.png',
        pets: [],
        memberLevel: MemberLevel.VIP,
        memberBalance: 5000,
        memberPoints: 120,
      },
      'customer-1',
    );
    await repository.create(customer);

    const { customer: result } = await service.execute('customer-1');

    expect(result.name).toBe('微信用户');
    expect(result.avatarUrl).toBe('https://example.com/avatar.png');
    expect(result.memberLevel).toBe(MemberLevel.VIP);
    expect(result.memberBalance).toBe(5000);
    expect(result.memberPoints).toBe(120);
  });

  it('顾客不存在 → EntityNotFound', async () => {
    await expect(service.execute('missing')).rejects.toBeInstanceOf(EntityNotFound);
  });
});
