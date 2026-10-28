import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { EntityNotFound } from '../errors/entity-not-found';

@Injectable()
export class GetMyMemberInfoService {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(customerId: string) {
    const customer = await this.customerRepository.findById(customerId);

    if (!customer) {
      throw new EntityNotFound('Customer', customerId);
    }

    return { customer };
  }
}
