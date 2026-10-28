import { SmsConfig, SmsProvider } from '@app/entities/sms-config';
import {
  SmsConfig as PrismaSmsConfig,
  SmsProvider as PrismaSmsProvider,
} from '@prisma/client';

export class SmsConfigMapper {
  static toPrisma(config: SmsConfig) {
    return {
      id: config.id,
      enabled: config.enabled,
      provider: config.provider as PrismaSmsProvider,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret,
      signName: config.signName,
      appointmentConfirmTemplateId: config.getTemplateId(
        'APPOINTMENT_CONFIRM' as any,
      ),
      appointmentRemindTemplateId: config.getTemplateId(
        'APPOINTMENT_REMIND' as any,
      ),
      appointmentCompleteTemplateId: config.getTemplateId(
        'APPOINTMENT_COMPLETE' as any,
      ),
      orderConfirmTemplateId: config.getTemplateId('ORDER_CONFIRM' as any),
      balanceChangeTemplateId: config.getTemplateId('BALANCE_CHANGE' as any),
      birthdayGreetingTemplateId: config.getTemplateId(
        'BIRTHDAY_GREETING' as any,
      ),
      appointmentConfirmEnabled: config.isScenarioEnabled(
        'APPOINTMENT_CONFIRM' as any,
      ),
      appointmentRemindEnabled: config.isScenarioEnabled(
        'APPOINTMENT_REMIND' as any,
      ),
      appointmentCompleteEnabled: config.isScenarioEnabled(
        'APPOINTMENT_COMPLETE' as any,
      ),
      orderConfirmEnabled: config.isScenarioEnabled('ORDER_CONFIRM' as any),
      balanceChangeEnabled: config.isScenarioEnabled('BALANCE_CHANGE' as any),
      birthdayGreetingEnabled: config.isScenarioEnabled(
        'BIRTHDAY_GREETING' as any,
      ),
      appointmentRemindHours: config.appointmentRemindHours,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }

  static toDomain(raw: PrismaSmsConfig): SmsConfig {
    return new SmsConfig(
      {
        enabled: raw.enabled,
        provider: raw.provider as SmsProvider,
        accessKeyId: raw.accessKeyId,
        accessKeySecret: raw.accessKeySecret,
        signName: raw.signName,
        appointmentConfirmTemplateId: raw.appointmentConfirmTemplateId,
        appointmentRemindTemplateId: raw.appointmentRemindTemplateId,
        appointmentCompleteTemplateId: raw.appointmentCompleteTemplateId,
        orderConfirmTemplateId: raw.orderConfirmTemplateId,
        balanceChangeTemplateId: raw.balanceChangeTemplateId,
        birthdayGreetingTemplateId: raw.birthdayGreetingTemplateId,
        appointmentConfirmEnabled: raw.appointmentConfirmEnabled,
        appointmentRemindEnabled: raw.appointmentRemindEnabled,
        appointmentCompleteEnabled: raw.appointmentCompleteEnabled,
        orderConfirmEnabled: raw.orderConfirmEnabled,
        balanceChangeEnabled: raw.balanceChangeEnabled,
        birthdayGreetingEnabled: raw.birthdayGreetingEnabled,
        appointmentRemindHours: raw.appointmentRemindHours,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
