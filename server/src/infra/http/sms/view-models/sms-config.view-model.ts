import { SmsConfig } from '@app/entities/sms-config';

export class SmsConfigViewModel {
  static toHTTP(config: SmsConfig) {
    return {
      id: config.id,
      enabled: config.enabled,
      provider: config.provider,
      accessKeyId: config.accessKeyId,
      accessKeySecret: this.maskSecret(config.accessKeySecret),
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

  private static maskSecret(secret: string): string {
    if (secret.length <= 8) return '****';
    return secret.slice(0, 4) + '****' + secret.slice(-4);
  }
}
