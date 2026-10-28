import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Encrypter } from '@app/cryptography/encrypter';
import { CUSTOMER_JWT_SERVICE } from './constants';

@Injectable()
export class CustomerJwtEncrypter extends Encrypter {
  constructor(@Inject(CUSTOMER_JWT_SERVICE) private jwtService: JwtService) {
    super();
  }

  encrypt(
    payload: Record<string, unknown>,
    options: { expiresIn: string | number },
  ): Promise<string> {
    return this.jwtService.signAsync(payload, options);
  }
}
