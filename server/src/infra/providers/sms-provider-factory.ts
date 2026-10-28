import { Injectable } from '@nestjs/common';
import { SmsProvider } from '../../app/providers/sms-provider';
import { MockSmsProvider } from './mock-sms-provider';

export enum SmsProviderType {
  ALIYUN = 'ALIYUN',
  TENCENT = 'TENCENT',
  HUAWEI = 'HUAWEI',
  MOCK = 'MOCK',
}

export interface SmsProviderConfig {
  provider: SmsProviderType;
  accessKeyId: string;
  accessKeySecret: string;
}

@Injectable()
export class SmsProviderFactory {
  createProvider(config: SmsProviderConfig): SmsProvider {
    const { provider, accessKeyId, accessKeySecret } = config;

    switch (provider) {
      case SmsProviderType.ALIYUN:
        // For now, use Mock provider for Aliyun
        // TODO: Replace with real AliyunSmsProvider when ready to purchase
        return new MockSmsProvider(accessKeyId, accessKeySecret);

      case SmsProviderType.TENCENT:
        // For now, use Mock provider for Tencent
        return new MockSmsProvider(accessKeyId, accessKeySecret);

      case SmsProviderType.HUAWEI:
        // For now, use Mock provider for Huawei
        return new MockSmsProvider(accessKeyId, accessKeySecret);

      case SmsProviderType.MOCK:
        return new MockSmsProvider(accessKeyId, accessKeySecret);

      default:
        throw new Error(`Unsupported SMS provider: ${provider}`);
    }
  }
}
