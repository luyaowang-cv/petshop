import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CustomerAuthContext } from '../customer-jwt.strategy';

export const CurrentCustomer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as CustomerAuthContext;
  },
);
