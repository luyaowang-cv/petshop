import { SmsRecord } from '@app/entities/sms-record';

export class SmsRecordViewModel {
  static toHTTP(record: SmsRecord) {
    return {
      id: record.id,
      phoneNumber: record.getMaskedPhoneNumber(),
      scenario: record.scenario,
      templateId: record.templateId,
      templateContent: record.templateContent,
      status: record.status,
      messageId: record.messageId,
      errorCode: record.errorCode,
      errorMessage: record.errorMessage,
      sentAt: record.sentAt,
      customerId: record.customerId,
      appointmentId: record.appointmentId,
      orderId: record.orderId,
      petId: record.petId,
    };
  }
}
