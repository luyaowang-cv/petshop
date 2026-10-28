import { JwtService } from '@nestjs/jwt';
import { CustomerJwtEncrypter } from './customer-jwt-encrypter';

describe('Customer JWT 隔离', () => {
  const customerSecret = 'customer-secret';
  const adminSecret = 'admin-secret';

  const customerJwtService = new JwtService({
    secret: customerSecret,
    signOptions: { algorithm: 'HS256' },
  });
  const adminJwtService = new JwtService({
    secret: adminSecret,
    signOptions: { algorithm: 'HS256' },
  });

  it('顾客 Encrypter 用 customer secret 签发，sub 为 customerId', async () => {
    const encrypter = new CustomerJwtEncrypter(customerJwtService);
    const token = await encrypter.encrypt({ sub: 'customer-1' }, { expiresIn: '1d' });

    const payload = await customerJwtService.verifyAsync(token);
    expect(payload.sub).toBe('customer-1');
  });

  it('admin token 无法通过 customer secret 校验（隔离）', async () => {
    const adminToken = await adminJwtService.signAsync({
      sub: 'admin-1',
      name: 'ADMIN',
      email: 'admin@email.com',
    });

    await expect(customerJwtService.verifyAsync(adminToken)).rejects.toThrow();
  });

  it('customer token 无法通过 admin secret 校验（隔离）', async () => {
    const customerToken = await customerJwtService.signAsync({ sub: 'customer-1' });

    await expect(adminJwtService.verifyAsync(customerToken)).rejects.toThrow();
  });
});
