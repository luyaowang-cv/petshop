import { Injectable, Logger } from '@nestjs/common';
import { Appointment, AppointmentStatus } from '@app/entities/appointment';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { SubscriptionMessageClient } from '@app/providers/subscription-message-client';
import { EntityNotFound } from '../errors/entity-not-found';
import { BadRequest } from '../errors/bad-request';

interface ReviewAppointmentRequest {
  appointmentId: string;
  action: 'CONFIRM' | 'REJECT';
  rejectReason?: string;
}

@Injectable()
export class ReviewAppointmentService {
  private readonly logger = new Logger(ReviewAppointmentService.name);

  constructor(
    private appointmentRepository: AppointmentRepository,
    private customerRepository: CustomerRepository,
    private subscriptionMessageClient: SubscriptionMessageClient,
  ) {}

  async execute(request: ReviewAppointmentRequest) {
    const appointment = await this.appointmentRepository.findById(
      request.appointmentId,
    );
    if (!appointment) {
      throw new EntityNotFound('Appointment', request.appointmentId);
    }

    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new BadRequest('仅待审核的预约可审核');
    }

    let rejectReason: string | null = null;
    if (request.action === 'CONFIRM') {
      appointment.status = AppointmentStatus.CONFIRMED;
    } else {
      const reason = request.rejectReason?.trim();
      if (!reason) {
        throw new BadRequest('拒绝必须填写理由');
      }
      appointment.status = AppointmentStatus.REJECTED;
      appointment.rejectReason = reason;
      rejectReason = reason;
    }

    await this.appointmentRepository.save(appointment);

    await this.sendReviewResultMessage(appointment, rejectReason);

    return { appointment };
  }

  private async sendReviewResultMessage(
    appointment: Appointment,
    rejectReason: string | null,
  ) {
    const ownerId = appointment.pet?.ownerId;
    if (!ownerId) {
      this.logger.warn('预约未关联宠物/客户，跳过订阅消息发送');
      return;
    }

    const customer = await this.customerRepository.findById(ownerId);
    if (!customer?.openid) {
      this.logger.warn(`顾客 ${ownerId} 无 openid，跳过订阅消息发送`);
      return;
    }

    try {
      await this.subscriptionMessageClient.sendReviewResult({
        openid: customer.openid,
        appointmentId: appointment.id,
        action:
          appointment.status === AppointmentStatus.REJECTED ? 'REJECT' : 'CONFIRM',
        rejectReason,
      });
    } catch (error) {
      // 订阅消息发送失败不应影响审核主流程
      this.logger.error(`审核结果订阅消息发送失败: ${error.message}`, error.stack);
    }
  }
}
