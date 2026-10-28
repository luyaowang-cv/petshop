import { Module } from '@nestjs/common';
import { ScheduleAppointmentService } from '@app/use-cases/appointment/schedule-appointment-service';
import { DatabaseModule } from '@infra/database/database.module';
import { AppointmentsController } from './appointments.controller';
import { ListAppointmentsService } from '@app/use-cases/appointment/list-appointments-service';
import { CancelAppointmentService } from '@app/use-cases/appointment/cancel-appointment-service';
import { ShowAppointmentService } from '@app/use-cases/appointment/show-appointment-service';
import { UpdateAppointmentStatusService } from '@app/use-cases/appointment/update-appointment-status-service';
import { ReviewAppointmentService } from '@app/use-cases/appointment/review-appointment-service';
import { SendAppointmentReminderService } from '@app/use-cases/subscription-message/send-appointment-reminder-service';
import { SubscriptionMessageClient } from '@app/providers/subscription-message-client';
import { MockSubscriptionMessageClient } from '@infra/providers/mock-subscription-message-client';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [DatabaseModule, SmsModule],
  controllers: [AppointmentsController],
  providers: [
    ScheduleAppointmentService,
    ShowAppointmentService,
    ListAppointmentsService,
    CancelAppointmentService,
    UpdateAppointmentStatusService,
    ReviewAppointmentService,
    SendAppointmentReminderService,
    {
      provide: SubscriptionMessageClient,
      // 未接入微信订阅消息前走 mock；接入真实小程序后替换为 HTTP 客户端
      useClass: MockSubscriptionMessageClient,
    },
  ],
})
export class AppointmentModule {}
