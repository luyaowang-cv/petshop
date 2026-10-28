import { CustomerRepository } from '@app/repositories/customer-repository';
import { Injectable } from '@nestjs/common';
import { EntityNotFound } from '../errors/entity-not-found';
import { MemberLevel } from '@app/entities/customer';

interface EditCustomerRequest {
  id: string;
  body: {
    name: string;
    phone: string;
    memberLevel?: MemberLevel;
    memberPoints?: number;
    memberBalance?: number;
    memberJoinedAt?: string;
  };
}

@Injectable()
export class EditCustomerService {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(request: EditCustomerRequest) {
    const customer = await this.customerRepository.findById(request.id);

    if (!customer) {
      throw new EntityNotFound('Customer', request.id);
    }
    const body = request.body;

    customer.name = body.name;
    customer.phone = body.phone;

    // 更新会员相关字段（如果提供）
    if (body.memberLevel !== undefined) {
      customer.memberLevel = body.memberLevel;
    }
    if (body.memberPoints !== undefined) {
      customer.memberPoints = body.memberPoints;
    }
    if (body.memberBalance !== undefined) {
      customer.memberBalance = body.memberBalance;
    }
    if (body.memberJoinedAt !== undefined) {
      customer.memberJoinedAt = body.memberJoinedAt
        ? new Date(body.memberJoinedAt)
        : null;
    }

    customer.updatedAt = new Date();

    await this.customerRepository.save(customer);

    return {
      customer,
    };
  }
}
