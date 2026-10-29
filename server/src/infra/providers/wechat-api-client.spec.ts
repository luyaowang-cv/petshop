import { HttpWechatApiClient } from './wechat-api-client';
import { WechatApiError } from '../../app/providers/wechat-api-client';

// 可注入的假 fetch，避免真实网络请求
function fakeFetch(responder: (url: string, init?: any) => any) {
  return (url: string, init?: any) => {
    const body = responder(url, init);
    return Promise.resolve({
      json: () => Promise.resolve(body),
    }) as any;
  };
}

describe('HttpWechatApiClient', () => {
  const appId = 'wx-app-id';
  const appSecret = 'wx-app-secret';

  describe('code2Session', () => {
    it('解析有效响应并返回 openid / sessionKey / unionid', async () => {
      const fetch = fakeFetch(() => ({
        openid: 'openid-123',
        session_key: 'session-key',
        unionid: 'unionid-456',
      }));

      const client = new HttpWechatApiClient(appId, appSecret, fetch);
      const result = await client.code2Session('valid-code');

      expect(result.openid).toBe('openid-123');
      expect(result.sessionKey).toBe('session-key');
      expect(result.unionid).toBe('unionid-456');
    });

    it('微信返回 errcode 时抛出 WechatApiError', async () => {
      const fetch = fakeFetch(() => ({
        errcode: 40029,
        errmsg: 'invalid code',
      }));

      const client = new HttpWechatApiClient(appId, appSecret, fetch);

      await expect(client.code2Session('bad-code')).rejects.toThrow(WechatApiError);
      await expect(client.code2Session('bad-code')).rejects.toMatchObject({
        errcode: 40029,
        errmsg: 'invalid code',
      });
    });
  });

  describe('getPhoneNumber', () => {
    it('解析有效响应并返回纯手机号', async () => {
      const fetch = fakeFetch((url: string) => {
        if (url.includes('cgi-bin/token')) {
          return { access_token: 'access-token', expires_in: 7200 };
        }
        return {
          errcode: 0,
          errmsg: 'ok',
          phone_info: {
            phoneNumber: '+8613800138000',
            purePhoneNumber: '13800138000',
            countryCode: '86',
          },
        };
      });

      const client = new HttpWechatApiClient(appId, appSecret, fetch);
      const result = await client.getPhoneNumber('phone-code');

      expect(result.phoneNumber).toBe('13800138000');
    });

    it('微信返回 errcode 时抛出 WechatApiError', async () => {
      const fetch = fakeFetch((url: string) => {
        if (url.includes('cgi-bin/token')) {
          return { access_token: 'access-token' };
        }
        return { errcode: 40001, errmsg: 'invalid credential' };
      });

      const client = new HttpWechatApiClient(appId, appSecret, fetch);

      await expect(client.getPhoneNumber('phone-code')).rejects.toThrow(WechatApiError);
    });

    it('响应缺少 phone_info 时抛出 WechatApiError', async () => {
      const fetch = fakeFetch((url: string) => {
        if (url.includes('cgi-bin/token')) {
          return { access_token: 'access-token' };
        }
        return { errcode: 0, errmsg: 'ok' };
      });

      const client = new HttpWechatApiClient(appId, appSecret, fetch);

      await expect(client.getPhoneNumber('phone-code')).rejects.toThrow(WechatApiError);
    });
  });

  describe('access_token 缓存', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('有效期（expires_in）到点后重新获取，不会永久复用', async () => {
      let tokenCalls = 0;
      const fetch = fakeFetch((url: string) => {
        if (url.includes('cgi-bin/token')) {
          tokenCalls += 1;
          return { access_token: `token-${tokenCalls}`, expires_in: 7200 };
        }
        return { errcode: 0, phone_info: { purePhoneNumber: '13800138000' } };
      });

      const now = 1_700_000_000_000;
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const client = new HttpWechatApiClient(appId, appSecret, fetch);

      await client.getPhoneNumber('c1');
      expect(tokenCalls).toBe(1);

      // 仍在有效期内：复用缓存
      jest.spyOn(Date, 'now').mockReturnValue(now + 60 * 60 * 1000);
      await client.getPhoneNumber('c2');
      expect(tokenCalls).toBe(1);

      // 超过 2 小时有效期：必须重新获取
      jest.spyOn(Date, 'now').mockReturnValue(now + 7200 * 1000 + 1000);
      await client.getPhoneNumber('c3');
      expect(tokenCalls).toBe(2);
    });

    it('遇到 42001（access_token 过期）时刷新 token 并重试一次', async () => {
      let tokenCalls = 0;
      let phoneCalls = 0;
      const fetch = fakeFetch((url: string) => {
        if (url.includes('cgi-bin/token')) {
          tokenCalls += 1;
          return { access_token: `token-${tokenCalls}`, expires_in: 7200 };
        }
        phoneCalls += 1;
        if (phoneCalls === 1) {
          return { errcode: 42001, errmsg: 'access_token expired' };
        }
        return { errcode: 0, phone_info: { purePhoneNumber: '13800138000' } };
      });

      const client = new HttpWechatApiClient(appId, appSecret, fetch);
      const result = await client.getPhoneNumber('phone-code');

      expect(result.phoneNumber).toBe('13800138000');
      expect(tokenCalls).toBe(2);
    });

    it('刷新 token 后仍然失败，则抛出 WechatApiError', async () => {
      const fetch = fakeFetch((url: string) => {
        if (url.includes('cgi-bin/token')) {
          return { access_token: 'access-token', expires_in: 7200 };
        }
        return { errcode: 42001, errmsg: 'access_token expired' };
      });

      const client = new HttpWechatApiClient(appId, appSecret, fetch);

      await expect(client.getPhoneNumber('phone-code')).rejects.toMatchObject({
        errcode: 42001,
      });
    });
  });
});
