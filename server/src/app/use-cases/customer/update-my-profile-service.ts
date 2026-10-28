import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { EntityNotFound } from '../errors/entity-not-found';

interface UpdateMyProfileRequest {
  customerId: string;
  name?: string;
  avatarUrl?: string;
}

@Injectable()
export class UpdateMyProfileService {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(request: UpdateMyProfileRequest) {
    const customer = await this.customerRepository.findById(request.customerId);
    if (!customer) throw new EntityNotFound('Customer', request.customerId);

    if (request.name !== undefined) customer.name = request.name;
    if (request.avatarUrl !== undefined) customer.avatarUrl = request.avatarUrl;

    await this.customerRepository.save(customer);

    return { customer };
  }
}
