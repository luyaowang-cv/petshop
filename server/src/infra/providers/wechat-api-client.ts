import { Injectable } from '@nestjs/common';
import {
  WechatApiClient,
  WechatApiError,
  WechatCode2SessionResult,
  WechatPhoneNumberResult,
} from '../../app/providers/wechat-api-client';

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

@Injectable()
export class HttpWechatApiClient extends WechatApiClient {
  private cachedAccessToken?: string;

  constructor(
    private readonly appId: string,
    private readonly appSecret: string,
    private readonly fetchImpl: FetchLike = fetch,
  ) {
    super();
  }

  async code2Session(code: string): Promise<WechatCode2SessionResult> {
    const url =
      `https://api.weixin.qq.com/sns/jscode2session` +
      `?appid=${this.appId}&secret=${this.appSecret}` +
      `&js_code=${code}&grant_type=authorization_code`;

    const data = await this.getJson(url);

    return {
      openid: data.openid,
      sessionKey: data.session_key,
      unionid: data.unionid,
    };
  }

  async getPhoneNumber(code: string): Promise<WechatPhoneNumberResult> {
    const accessToken = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;

    const data = await this.getJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const phoneNumber = data.phone_info?.purePhoneNumber;
    if (!phoneNumber) {
      throw new WechatApiError(-1, 'phone number not found in response');
    }

    return { phoneNumber };
  }

  private async getAccessToken(): Promise<string> {
    const cached = this.cachedAccessToken;
    if (cached) {
      return cached;
    }

    const url =
      `https://api.weixin.qq.com/cgi-bin/token` +
      `?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;

    const data = await this.getJson(url);
    const token = data.access_token as string;
    this.cachedAccessToken = token;
    return token;
  }

  private async getJson(url: string, init?: RequestInit): Promise<any> {
    const response = await this.fetchImpl(url, init);
    const data = await response.json();

    if (data.errcode && data.errcode !== 0) {
      const endpoint = url.includes('jscode2session')
        ? 'code2Session'
        : url.includes('getuserphonenumber')
          ? 'getPhoneNumber'
          : url.includes('/token')
            ? 'getAccessToken'
            : 'wechat-api';
      // 只打印 endpoint + errcode/errmsg，不打印 url（url 含 AppSecret/access_token）
      console.error(
        `[WeChat] ${endpoint} failed: errcode=${data.errcode} errmsg=${data.errmsg}`,
      );
      throw new WechatApiError(data.errcode, data.errmsg ?? 'unknown error');
    }

    return data;
  }
}
