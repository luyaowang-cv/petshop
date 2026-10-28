import { Injectable, Logger } from '@nestjs/common';
import {
  WechatApiClient,
  WechatCode2SessionResult,
  WechatPhoneNumberResult,
} from '../../app/providers/wechat-api-client';

@Injectable()
export class MockWechatApiClient extends WechatApiClient {
  private readonly logger = new Logger(MockWechatApiClient.name);

  async code2Session(code: string): Promise<WechatCode2SessionResult> {
    this.logger.log(`[MOCK WeChat] code2Session for code: ${code}`);
    return {
      openid: `mock-openid-${code}`,
      sessionKey: `mock-session-${code}`,
    };
  }

  async getPhoneNumber(code: string): Promise<WechatPhoneNumberResult> {
    this.logger.log(`[MOCK WeChat] getPhoneNumber for code: ${code}`);
    // 从 code 派生稳定手机号，便于本地开发区分不同用户
    let seed = 0;
    for (const ch of code) {
      seed = (seed * 31 + ch.charCodeAt(0)) % 1e9;
    }
    return { phoneNumber: `138${String(seed).padStart(8, '0')}` };
  }
}
