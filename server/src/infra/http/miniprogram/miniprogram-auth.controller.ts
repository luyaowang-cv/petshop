import { Body, Controller, Post } from '@nestjs/common';
import { AuthenticateCustomerService } from '@app/use-cases/customer/authenticate-customer-service';
import { PublicRoute } from '@infra/auth/decorators/public-route-decorator';
import { CustomerViewModel } from '../view-models/customer-view-model';
import { AuthenticateCustomerBody } from './dtos/authenticate-customer-body';

@Controller('miniprogram/auth')
export class MiniprogramAuthController {
  constructor(private authenticateCustomerService: AuthenticateCustomerService) {}

  @PublicRoute()
  @Post()
  async login(@Body() body: AuthenticateCustomerBody) {
    const { customer, accessToken, refreshToken, isNewCustomer } =
      await this.authenticateCustomerService.execute(body);

    return {
      customer: CustomerViewModel.toHTTP(customer),
      accessToken,
      refreshToken,
      isNewCustomer,
    };
  }
}
