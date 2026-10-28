import { Injectable, Logger } from '@nestjs/common';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { SubscriptionMessageClient } from '@app/providers/subscription-message-client';
import { EntityNotFound } from '../errors/entity-not-found';

interface SendAppointmentReminderRequest {
  appointmentId: string;
}

// 预约提醒：向顾客推送「预约即将开始」。
// 实际的「预约时间前 N 小时」调度由定时任务触发本服务（本期 MVP 未接定时任务，仅提供可调用能力）。
@Injectable()
export class SendAppointmentReminderService {
  private readonly logger = new Logger(SendAppointmentReminderService.name);

  constructor(
    private appointmentRepository: AppointmentRepository,
    private customerRepository: CustomerRepository,
    private subscriptionMessageClient: SubscriptionMessageClient,
  ) {}

  async execute(request: SendAppointmentReminderRequest) {
    const appointment = await this.appointmentRepository.findById(
      request.appointmentId,
    );
    if (!appointment) {
      throw new EntityNotFound('Appointment', request.appointmentId);
    }

    const ownerId = appointment.pet?.ownerId;
    if (!ownerId) {
      this.logger.warn('预约未关联宠物/客户，跳过提醒发送');
      return { sent: false };
    }

    const customer = await this.customerRepository.findById(ownerId);
    if (!customer?.openid) {
      this.logger.warn(`顾客 ${ownerId} 无 openid，跳过提醒发送`);
      return { sent: false };
    }

    try {
      await this.subscriptionMessageClient.sendAppointmentReminder({
        openid: customer.openid,
        appointmentId: appointment.id,
        appointmentTime: appointment.appointmentTime,
        serviceTitle: appointment.service?.title ?? '宠物服务',
      });
      return { sent: true };
    } catch (error) {
      this.logger.error(`预约提醒订阅消息发送失败: ${error.message}`, error.stack);
      return { sent: false };
    }
  }
}
