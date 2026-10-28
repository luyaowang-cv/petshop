import { Controller, Get, UseGuards } from '@nestjs/common';
import { PublicRoute } from '@infra/auth/decorators/public-route-decorator';
import { CustomerJwtAuthGuard } from '@infra/auth/customer-jwt-auth.guard';
import { ListActivePetshopServices } from '@app/use-cases/petshop-service/list-active-petshop-services';
import { PetshopServiceViewModel } from '../view-models/petshop-service-view-model';

@PublicRoute() // 跳过全局 admin JWT 守卫，改用下方顾客守卫
@UseGuards(CustomerJwtAuthGuard)
@Controller('miniprogram/services')
export class MiniprogramServiceController {
  constructor(
    private listActivePetshopServices: ListActivePetshopServices,
  ) {}

  @Get()
  async list() {
    const { petshopServices } = await this.listActivePetshopServices.execute();
    return { services: petshopServices.map(PetshopServiceViewModel.toHTTP) };
  }
}
