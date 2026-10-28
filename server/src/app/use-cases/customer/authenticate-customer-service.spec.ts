import { JwtService } from '@nestjs/jwt';
import { Customer, MemberLevel } from '@app/entities/customer';
import { CustomerRepository } from '@app/repositories/customer-repository';
import {
  WechatApiClient,
  WechatApiError,
  WechatCode2SessionResult,
  WechatPhoneNumberResult,
} from '@app/providers/wechat-api-client';
import { CustomerJwtEncrypter } from '@infra/auth/customer-jwt-encrypter';
import { Unauthorized } from '../errors/unauthorized';
import { AuthenticateCustomerService } from './authenticate-customer-service';

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

  async findMany(): Promise<Customer[]> {
    return this.customers;
  }

  async create(customer: Customer): Promise<void> {
    this.customers.push(customer);
  }

  async save(customer: Customer): Promise<void> {
    const index = this.customers.findIndex((c) => c.id === customer.id);
    if (index >= 0) this.customers[index] = customer;
  }

  async deleteById(id: string): Promise<void> {
    this.customers = this.customers.filter((c) => c.id !== id);
  }
}

class FakeWechatApiClient extends WechatApiClient {
  constructor(
    private readonly openidByCode: Map<string, string>,
    private readonly phoneByCode: Map<string, string>,
  ) {
    super();
  }

  async code2Session(code: string): Promise<WechatCode2SessionResult> {
    const openid = this.openidByCode.get(code);
    if (!openid) throw new WechatApiError(40029, 'invalid code');
    return { openid, sessionKey: 'test-session-key' };
  }

  async getPhoneNumber(code: string): Promise<WechatPhoneNumberResult> {
    const phone = this.phoneByCode.get(code);
    if (!phone) throw new WechatApiError(40001, 'invalid phone code');
    return { phoneNumber: phone };
  }
}

describe('AuthenticateCustomerService', () => {
  let repository: InMemoryCustomerRepository;
  let service: AuthenticateCustomerService;
  let openidByCode: Map<string, string>;
  let phoneByCode: Map<string, string>;
  let encrypter: CustomerJwtEncrypter;

  beforeEach(() => {
    repository = new InMemoryCustomerRepository();
    openidByCode = new Map([['code-1', 'openid-1']]);
    phoneByCode = new Map([['phone-code-1', '13800138000']]);
    const wechatClient = new FakeWechatApiClient(openidByCode, phoneByCode);
    encrypter = new CustomerJwtEncrypter(
      new JwtService({ secret: 'test-secret', signOptions: { algorithm: 'HS256' } }),
    );
    service = new AuthenticateCustomerService(
      repository,
      wechatClient,
      encrypter,
    );
  });

  it('首次登录创建顾客并签发 token', async () => {
    const result = await service.execute({
      code: 'code-1',
      phoneCode: 'phone-code-1',
    });

    expect(result.isNewCustomer).toBe(true);
    expect(result.customer.openid).toBe('openid-1');
    expect(result.customer.phone).toBe('13800138000');
    expect(result.customer.memberLevel).toBe(MemberLevel.REGULAR);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(repository.customers).toHaveLength(1);
  });

  it('同一 openid 再次登录返回同一顾客（不重复创建）', async () => {
    const first = await service.execute({
      code: 'code-1',
      phoneCode: 'phone-code-1',
    });
    const second = await service.execute({
      code: 'code-1',
      phoneCode: 'phone-code-1',
    });

    expect(second.isNewCustomer).toBe(false);
    expect(second.customer.id).toBe(first.customer.id);
    expect(repository.customers).toHaveLength(1);
  });

  it('已有手机号但无 openid 时绑定 openid（不新建）', async () => {
    const existing = new Customer({
      name: '老顾客',
      phone: '13800138000',
      pets: [],
    });
    await repository.create(existing);

    const result = await service.execute({
      code: 'code-1',
      phoneCode: 'phone-code-1',
    });

    expect(result.isNewCustomer).toBe(false);
    expect(result.customer.id).toBe(existing.id);
    expect(result.customer.openid).toBe('openid-1');
    expect(repository.customers).toHaveLength(1);
  });

  it('非法 code 抛出 Unauthorized', async () => {
    await expect(
      service.execute({ code: 'bad-code', phoneCode: 'phone-code-1' }),
    ).rejects.toBeInstanceOf(Unauthorized);
  });

  it('非法 phoneCode 抛出 Unauthorized', async () => {
    await expect(
      service.execute({ code: 'code-1', phoneCode: 'bad-phone-code' }),
    ).rejects.toBeInstanceOf(Unauthorized);
  });
});
