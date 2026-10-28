import { Injectable } from '@nestjs/common';
import { Customer } from '@app/entities/customer';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { WechatApiClient, WechatApiError } from '@app/providers/wechat-api-client';
import { CustomerJwtEncrypter } from '@infra/auth/customer-jwt-encrypter';
import { Unauthorized } from '../errors/unauthorized';
import { generateCustomerAccessTokens } from './helpers/generate-customer-access-tokens';

interface AuthenticateCustomerRequest {
  code: string;
  phoneCode: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthenticateCustomerResponse {
  customer: Customer;
  accessToken: string;
  refreshToken: string;
  isNewCustomer: boolean;
}

@Injectable()
export class AuthenticateCustomerService {
  constructor(
    private customerRepository: CustomerRepository,
    private wechatApiClient: WechatApiClient,
    private customerEncrypter: CustomerJwtEncrypter,
  ) {}

  async execute(
    request: AuthenticateCustomerRequest,
  ): Promise<AuthenticateCustomerResponse> {
    const openid = await this.resolveOpenid(request.code);
    const phone = await this.resolvePhone(request.phoneCode);

    let customer = await this.customerRepository.findByOpenid(openid);
    let isNewCustomer = false;

    if (customer) {
      customer.phone = phone;
      this.applyProfile(customer, request);
      await this.customerRepository.save(customer);
    } else {
      customer = await this.customerRepository.findByPhone(phone);

      if (customer) {
        customer.openid = openid;
        this.applyProfile(customer, request);
        await this.customerRepository.save(customer);
      } else {
        customer = new Customer({
          name: request.name ?? '微信用户',
          phone,
          openid,
          avatarUrl: request.avatarUrl ?? null,
          pets: [],
        });
        await this.customerRepository.create(customer);
        isNewCustomer = true;
      }
    }

    const { accessToken, refreshToken } = await generateCustomerAccessTokens(
      customer.id,
      this.customerEncrypter,
    );

    return { customer, accessToken, refreshToken, isNewCustomer };
  }

  private applyProfile(customer: Customer, request: AuthenticateCustomerRequest) {
    if (request.name) customer.name = request.name;
    if (request.avatarUrl) customer.avatarUrl = request.avatarUrl;
  }

  private async resolveOpenid(code: string): Promise<string> {
    try {
      const result = await this.wechatApiClient.code2Session(code);
      return result.openid;
    } catch (error) {
      if (error instanceof WechatApiError) {
        throw new Unauthorized('微信登录凭证无效');
      }
      throw error;
    }
  }

  private async resolvePhone(phoneCode: string): Promise<string> {
    try {
      const result = await this.wechatApiClient.getPhoneNumber(phoneCode);
      return result.phoneNumber;
    } catch (error) {
      if (error instanceof WechatApiError) {
        throw new Unauthorized('微信手机号授权无效');
      }
      throw error;
    }
  }
}
