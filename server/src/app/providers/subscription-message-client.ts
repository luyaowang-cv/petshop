// 微信订阅消息发送抽象（一次性订阅）
// 真实实现接入微信 subscribeMessage.send 接口；MVP 本地用 mock。

export type ReviewResultSubscriptionMessage = {
  openid: string;
  appointmentId: string;
  action: 'CONFIRM' | 'REJECT';
  rejectReason?: string | null;
};

export type AppointmentReminderSubscriptionMessage = {
  openid: string;
  appointmentId: string;
  appointmentTime: Date;
  serviceTitle: string;
};

export abstract class SubscriptionMessageClient {
  abstract sendReviewResult(
    message: ReviewResultSubscriptionMessage,
  ): Promise<void>;

  abstract sendAppointmentReminder(
    message: AppointmentReminderSubscriptionMessage,
  ): Promise<void>;
}
