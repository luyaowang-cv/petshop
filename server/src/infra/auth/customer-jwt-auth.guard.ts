import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Unauthorized } from '@app/use-cases/errors/unauthorized';

@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('customer-jwt') {
  handleRequest(err: null | Error, customer: any, info: any) {
    if (err || !customer) {
      throw new Unauthorized('Invalid token');
    }
    return customer;
  }
}
