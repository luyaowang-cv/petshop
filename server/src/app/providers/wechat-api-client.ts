// WeChat API client interface and types

export interface WechatCode2SessionResult {
  openid: string;
  sessionKey: string;
  unionid?: string;
}

export interface WechatPhoneNumberResult {
  phoneNumber: string;
}

export class WechatApiError extends Error {
  constructor(
    public readonly errcode: number,
    public readonly errmsg: string,
  ) {
    super(`WeChat API error ${errcode}: ${errmsg}`);
    this.name = 'WechatApiError';
  }
}

export abstract class WechatApiClient {
  abstract code2Session(code: string): Promise<WechatCode2SessionResult>;
  abstract getPhoneNumber(code: string): Promise<WechatPhoneNumberResult>;
}
