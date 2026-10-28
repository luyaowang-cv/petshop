import { Customer } from '@app/entities/customer';

export class MeViewModel {
  static toHTTP(customer: Customer) {
    return {
      name: customer.name,
      avatarUrl: customer.avatarUrl,
      memberLevel: customer.memberLevel,
      memberBalance: customer.memberBalance,
      memberPoints: customer.memberPoints,
    };
  }
}
