import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PublicRoute } from '@infra/auth/decorators/public-route-decorator';
import { CustomerJwtAuthGuard } from '@infra/auth/customer-jwt-auth.guard';
import { CurrentCustomer } from '@infra/auth/decorators/current-customer-decorator';
import { CustomerAuthContext } from '@infra/auth/customer-jwt.strategy';
import { GetCustomerConsumptionRecordsService } from '@app/use-cases/customer/get-customer-consumption-records-service';
import { ListPointsRecordsService } from '@app/use-cases/member/list-points-records-service';

@PublicRoute() // 跳过全局 admin JWT 守卫，改用下方顾客守卫
@UseGuards(CustomerJwtAuthGuard)
@Controller('miniprogram')
export class MiniprogramRecordsController {
  constructor(
    private getCustomerConsumptionRecordsService: GetCustomerConsumptionRecordsService,
    private listPointsRecordsService: ListPointsRecordsService,
  ) {}

  /** 我的消费记录（商品订单 + 已完成的服务） */
  @Get('consumption-records')
  async consumptionRecords(
    @CurrentCustomer() customer: CustomerAuthContext,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const result = await this.getCustomerConsumptionRecordsService.execute({
      customerId: customer.customerId,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });

    return {
      ...result,
      records: result.records.map((record) => ({
        ...record,
        date: record.date.toISOString(),
      })),
    };
  }

  /** 我的积分明细 */
  @Get('points-records')
  async pointsRecords(@CurrentCustomer() customer: CustomerAuthContext) {
    const { records } = await this.listPointsRecordsService.execute({
      customerId: customer.customerId,
    });

    return {
      records: records.map((record) => ({
        id: record.id,
        action: record.action,
        points: record.points,
        balance: record.balance,
        reason: record.reason ?? '',
        createdAt: record.createdAt.toISOString(),
      })),
    };
  }
}
