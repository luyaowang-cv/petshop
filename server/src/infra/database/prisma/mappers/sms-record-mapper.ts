import { SmsRecord, SmsStatus } from '@app/entities/sms-record';
import { SmsScenario } from '@app/entities/sms-config';
import {
  SmsRecord as PrismaSmsRecord,
  SmsScenario as PrismaSmsScenario,
  SmsStatus as PrismaSmsStatus,
} from '@prisma/client';

export class SmsRecordMapper {
  static toPrisma(record: SmsRecord) {
    return {
      id: record.id,
      phoneNumber: record.phoneNumber,
      scenario: record.scenario as PrismaSmsScenario,
      templateId: record.templateId,
      templateContent: record.templateContent,
      status: record.status as PrismaSmsStatus,
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

  static toDomain(raw: PrismaSmsRecord): SmsRecord {
    return new SmsRecord(
      {
        phoneNumber: raw.phoneNumber,
        scenario: raw.scenario as SmsScenario,
        templateId: raw.templateId,
        templateContent: raw.templateContent,
        status: raw.status as SmsStatus,
        messageId: raw.messageId,
        errorCode: raw.errorCode,
        errorMessage: raw.errorMessage,
        sentAt: raw.sentAt,
        customerId: raw.customerId,
        appointmentId: raw.appointmentId,
        orderId: raw.orderId,
        petId: raw.petId,
      },
      raw.id,
    );
  }
}
