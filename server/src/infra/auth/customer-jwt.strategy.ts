import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';
import { CustomerTokenPayload } from '@app/use-cases/customer/helpers/generate-customer-access-tokens';

export interface CustomerAuthContext {
  customerId: string;
}

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConstants.customerJwtSecret,
    });
  }

  async validate(payload: CustomerTokenPayload): Promise<CustomerAuthContext> {
    return { customerId: payload.sub };
  }
}
