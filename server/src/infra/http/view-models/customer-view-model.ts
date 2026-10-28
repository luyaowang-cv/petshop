import { Customer } from '@app/entities/customer';
import { PetViewModel } from './pet-view-model';

export class CustomerViewModel {
  static toHTTP(customer: Customer) {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      avatarUrl: customer.avatarUrl,
      pets: customer.pets.map(PetViewModel.toHTTP),
      notes: customer.notes,
      lastVisitAt: customer.lastVisitAt?.toISOString() ?? null,
      totalSpent: customer.totalSpent,
      memberLevel: customer.memberLevel,
      memberPoints: customer.memberPoints,
      memberBalance: customer.memberBalance,
      memberJoinedAt: customer.memberJoinedAt?.toISOString() ?? null,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }
}
