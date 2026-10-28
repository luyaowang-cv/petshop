import { SmsConfig } from '@app/entities/sms-config';

export abstract class SmsConfigRepository {
  abstract upsert(config: SmsConfig): Promise<SmsConfig>;
  abstract findFirst(): Promise<SmsConfig | null>;
  abstract update(id: string, config: Partial<SmsConfig>): Promise<SmsConfig>;
}
