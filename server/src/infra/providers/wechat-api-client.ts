import { Injectable } from '@nestjs/common';
import {
  WechatApiClient,
  WechatApiError,
  WechatCode2SessionResult,
  WechatPhoneNumberResult,
} from '../../app/providers/wechat-api-client';

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

// 微信 access_token 有效期 7200s；提前 5 分钟刷新，避免临界过期
const ACCESS_TOKEN_SAFETY_MS = 5 * 60 * 1000;

// 这些 errcode 表示 access_token 失效，可刷新后重试一次
const TOKEN_INVALID_ERRCODES = new Set([40001, 40014, 42001]);

@Injectable()
export class HttpWechatApiClient extends WechatApiClient {
  private cachedAccessToken?: string;
  private accessTokenExpiresAt = 0;

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
    return this.requestPhoneNumber(code, false);
  }

  private async requestPhoneNumber(
    code: string,
    isRetry: boolean,
  ): Promise<WechatPhoneNumberResult> {
    // 重试时强制刷新 access_token
    const accessToken = await this.getAccessToken(isRetry);
    const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;

    let data: any;
    try {
      data = await this.getJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
    } catch (error) {
      // access_token 过期/失效：刷新后重试一次
      if (
        !isRetry &&
        error instanceof WechatApiError &&
        TOKEN_INVALID_ERRCODES.has(error.errcode)
      ) {
        this.cachedAccessToken = undefined;
        this.accessTokenExpiresAt = 0;
        return this.requestPhoneNumber(code, true);
      }
      throw error;
    }

    const phoneNumber = data.phone_info?.purePhoneNumber;
    if (!phoneNumber) {
      throw new WechatApiError(-1, 'phone number not found in response');
    }

    return { phoneNumber };
  }

  private async getAccessToken(forceRefresh = false): Promise<string> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cachedAccessToken &&
      now < this.accessTokenExpiresAt
    ) {
      return this.cachedAccessToken;
    }

    const url =
      `https://api.weixin.qq.com/cgi-bin/token` +
      `?grant_type=client_credential&appid=${this.appId}&secret=${this.appSecret}`;

    const data = await this.getJson(url);
    const token = data.access_token as string;
    const expiresIn = Number(data.expires_in) || 7200;

    this.cachedAccessToken = token;
    this.accessTokenExpiresAt = now + expiresIn * 1000 - ACCESS_TOKEN_SAFETY_MS;
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
