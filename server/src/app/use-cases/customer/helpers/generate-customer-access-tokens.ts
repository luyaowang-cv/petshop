import { Encrypter } from '@app/cryptography/encrypter';

export interface CustomerTokenPayload {
  sub: string;
}

export async function generateCustomerAccessTokens(
  customerId: string,
  encrypter: Encrypter,
) {
  const payload: CustomerTokenPayload = { sub: customerId };

  const [accessToken, refreshToken] = await Promise.all([
    encrypter.encrypt({ ...payload }, { expiresIn: '30d' }),
    encrypter.encrypt({ ...payload }, { expiresIn: '60d' }),
  ]);

  return { accessToken, refreshToken };
}
