import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { PublicRoute } from '@infra/auth/decorators/public-route-decorator';
import { CustomerJwtAuthGuard } from '@infra/auth/customer-jwt-auth.guard';
import { CurrentCustomer } from '@infra/auth/decorators/current-customer-decorator';
import { CustomerAuthContext } from '@infra/auth/customer-jwt.strategy';
import { GetMyMemberInfoService } from '@app/use-cases/customer/get-my-member-info-service';
import { UpdateMyProfileService } from '@app/use-cases/customer/update-my-profile-service';
import { UpdateMyProfileBody } from './dtos/update-my-profile-body';
import { MeViewModel } from '../view-models/me-view-model';

@PublicRoute() // 跳过全局 admin JWT 守卫，改用下方顾客守卫
@UseGuards(CustomerJwtAuthGuard)
@Controller('miniprogram/me')
export class MiniprogramMeController {
  constructor(
    private getMyMemberInfoService: GetMyMemberInfoService,
    private updateMyProfileService: UpdateMyProfileService,
  ) {}

  @Get()
  async me(@CurrentCustomer() customer: CustomerAuthContext) {
    const { customer: found } = await this.getMyMemberInfoService.execute(
      customer.customerId,
    );

    return { me: MeViewModel.toHTTP(found) };
  }

  @Patch()
  async update(
    @CurrentCustomer() customer: CustomerAuthContext,
    @Body() body: UpdateMyProfileBody,
  ) {
    const { customer: updated } = await this.updateMyProfileService.execute({
      customerId: customer.customerId,
      name: body.name,
      avatarUrl: body.avatarUrl,
    });

    return { me: MeViewModel.toHTTP(updated) };
  }
}
