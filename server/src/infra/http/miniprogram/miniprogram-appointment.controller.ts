import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PublicRoute } from '@infra/auth/decorators/public-route-decorator';
import { CustomerJwtAuthGuard } from '@infra/auth/customer-jwt-auth.guard';
import { CurrentCustomer } from '@infra/auth/decorators/current-customer-decorator';
import { CustomerAuthContext } from '@infra/auth/customer-jwt.strategy';
import { ScheduleMyAppointmentService } from '@app/use-cases/appointment/schedule-my-appointment-service';
import { ListMyAppointmentsService } from '@app/use-cases/appointment/list-my-appointments-service';
import { CancelMyAppointmentService } from '@app/use-cases/appointment/cancel-my-appointment-service';
import { AppointmentViewModel } from '../view-models/appointment-view-model';
import { CreateMyAppointmentBody } from './dtos/create-my-appointment-body';

@PublicRoute() // 跳过全局 admin JWT 守卫，改用下方顾客守卫
@UseGuards(CustomerJwtAuthGuard)
@Controller('miniprogram/appointments')
export class MiniprogramAppointmentController {
  constructor(
    private scheduleMyAppointmentService: ScheduleMyAppointmentService,
    private listMyAppointmentsService: ListMyAppointmentsService,
    private cancelMyAppointmentService: CancelMyAppointmentService,
  ) {}

  @Get()
  async list(@CurrentCustomer() customer: CustomerAuthContext) {
    const { appointments } = await this.listMyAppointmentsService.execute(
      customer.customerId,
    );
    return { appointments: appointments.map(AppointmentViewModel.toHTTP) };
  }

  @Post()
  async create(
    @CurrentCustomer() customer: CustomerAuthContext,
    @Body() body: CreateMyAppointmentBody,
  ) {
    const { appointment } = await this.scheduleMyAppointmentService.execute({
      ...body,
      customerId: customer.customerId,
    });
    return { appointment: AppointmentViewModel.toHTTP(appointment) };
  }

  @Post('/:id/cancel')
  async cancel(
    @CurrentCustomer() customer: CustomerAuthContext,
    @Param('id') id: string,
  ) {
    const { appointment } = await this.cancelMyAppointmentService.execute({
      customerId: customer.customerId,
      appointmentId: id,
    });
    return { appointment: AppointmentViewModel.toHTTP(appointment) };
  }
}
