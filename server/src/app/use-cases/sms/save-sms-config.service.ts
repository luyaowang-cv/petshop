import { Injectable } from '@nestjs/common';
import { SmsConfigRepository } from '@app/repositories/sms-config-repository';
import { AesEncrypter } from '@app/cryptography/aes-encrypter';
import { SmsConfig, SmsProvider } from '@app/entities/sms-config';

interface SaveSmsConfigRequest {
  enabled: boolean;
  provider: string;
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  appointmentConfirmTemplateId?: string;
  appointmentRemindTemplateId?: string;
  appointmentCompleteTemplateId?: string;
  orderConfirmTemplateId?: string;
  balanceChangeTemplateId?: string;
  birthdayGreetingTemplateId?: string;
  appointmentConfirmEnabled: boolean;
  appointmentRemindEnabled: boolean;
  appointmentCompleteEnabled: boolean;
  orderConfirmEnabled: boolean;
  balanceChangeEnabled: boolean;
  birthdayGreetingEnabled: boolean;
  appointmentRemindHours: number;
}

@Injectable()
export class SaveSmsConfigService {
  constructor(
    private smsConfigRepository: SmsConfigRepository,
    private aesEncrypter: AesEncrypter,
  ) {}

  async execute(request: SaveSmsConfigRequest): Promise<SmsConfig> {
    // Encrypt AccessKey Secret
    const encryptedSecret = await this.aesEncrypter.encrypt(
      request.accessKeySecret,
    );

    // Create config entity
    const config = new SmsConfig({
      enabled: request.enabled,
      provider: request.provider as SmsProvider,
      accessKeyId: request.accessKeyId,
      accessKeySecret: encryptedSecret,
      signName: request.signName,
      appointmentConfirmTemplateId: request.appointmentConfirmTemplateId,
      appointmentRemindTemplateId: request.appointmentRemindTemplateId,
      appointmentCompleteTemplateId: request.appointmentCompleteTemplateId,
      orderConfirmTemplateId: request.orderConfirmTemplateId,
      balanceChangeTemplateId: request.balanceChangeTemplateId,
      birthdayGreetingTemplateId: request.birthdayGreetingTemplateId,
      appointmentConfirmEnabled: request.appointmentConfirmEnabled,
      appointmentRemindEnabled: request.appointmentRemindEnabled,
      appointmentCompleteEnabled: request.appointmentCompleteEnabled,
      orderConfirmEnabled: request.orderConfirmEnabled,
      balanceChangeEnabled: request.balanceChangeEnabled,
      birthdayGreetingEnabled: request.birthdayGreetingEnabled,
      appointmentRemindHours: request.appointmentRemindHours,
    });

    // Upsert configuration
    return this.smsConfigRepository.upsert(config);
  }
}
