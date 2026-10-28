import { Injectable, Logger } from '@nestjs/common';
import {
  AppointmentReminderSubscriptionMessage,
  ReviewResultSubscriptionMessage,
  SubscriptionMessageClient,
} from '@app/providers/subscription-message-client';

// 本地开发用 mock：不真正调用微信订阅消息接口，仅记录发送内容便于联调/验证。
@Injectable()
export class MockSubscriptionMessageClient extends SubscriptionMessageClient {
  private readonly logger = new Logger(MockSubscriptionMessageClient.name);
  public readonly reviewResultMessages: ReviewResultSubscriptionMessage[] = [];
  public readonly reminderMessages: AppointmentReminderSubscriptionMessage[] =
    [];

  async sendReviewResult(message: ReviewResultSubscriptionMessage): Promise<void> {
    this.reviewResultMessages.push(message);
    this.logger.log(
      `[mock] 审核结果订阅消息 -> openid=${message.openid} action=${message.action} reason=${message.rejectReason ?? ''}`,
    );
  }

  async sendAppointmentReminder(
    message: AppointmentReminderSubscriptionMessage,
  ): Promise<void> {
    this.reminderMessages.push(message);
    this.logger.log(
      `[mock] 预约提醒订阅消息 -> openid=${message.openid} time=${message.appointmentTime.toISOString()} service=${message.serviceTitle}`,
    );
  }
}
