import { Injectable } from '@nestjs/common';
import { SmsConfigRepository } from '@app/repositories/sms-config-repository';
import { SmsConfig } from '@app/entities/sms-config';

@Injectable()
export class GetSmsConfigService {
  constructor(private smsConfigRepository: SmsConfigRepository) {}

  async execute(): Promise<SmsConfig | null> {
    return this.smsConfigRepository.findFirst();
  }
}
