import { Customer, MemberLevel } from '@app/entities/customer';
import { Prisma, MemberLevel as PrismaMemberLevel } from '@prisma/client';
import { PetMapper } from './pet-mapper';

type RawCustomerWithPets = Prisma.CustomerGetPayload<{
  include: { pets: true };
}>;

export class CustomerMapper {
  static toPrisma(customer: Customer) {
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      openid: customer.openid,
      avatarUrl: customer.avatarUrl,
      notes: customer.notes,
      lastVisitAt: customer.lastVisitAt,
      totalSpent: customer.totalSpent,
      memberLevel: customer.memberLevel as PrismaMemberLevel,
      memberPoints: customer.memberPoints,
      memberBalance: customer.memberBalance,
      memberJoinedAt: customer.memberJoinedAt,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  static toDomain(raw: RawCustomerWithPets) {
    return new Customer(
      {
        name: raw.name,
        phone: raw.phone,
        openid: raw.openid,
        avatarUrl: raw.avatarUrl,
        pets: raw.pets.map(PetMapper.toDomain),
        notes: raw.notes,
        lastVisitAt: raw.lastVisitAt,
        totalSpent: raw.totalSpent,
        memberLevel: raw.memberLevel as MemberLevel,
        memberPoints: raw.memberPoints,
        memberBalance: raw.memberBalance,
        memberJoinedAt: raw.memberJoinedAt,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }
}
