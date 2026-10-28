import { Customer } from '@app/entities/customer';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { Injectable } from '@nestjs/common';
import { CustomerMapper } from '../mappers/customer-mapper';
import { PrismaService } from '../prisma.service';
import { PetMapper } from '../mappers/pet-mapper';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private prismaService: PrismaService) {}

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.prismaService.customer.findUnique({
      where: {
        id,
      },
      include: { pets: true },
    });

    if (!customer) return null;

    return CustomerMapper.toDomain(customer);
  }

  async findByOpenid(openid: string): Promise<Customer | null> {
    const customer = await this.prismaService.customer.findUnique({
      where: {
        openid,
      },
      include: { pets: true },
    });

    if (!customer) return null;

    return CustomerMapper.toDomain(customer);
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const customer = await this.prismaService.customer.findFirst({
      where: {
        phone,
      },
      include: { pets: true },
    });

    if (!customer) return null;

    return CustomerMapper.toDomain(customer);
  }

  async findMany(): Promise<Customer[]> {
    const customers = await this.prismaService.customer.findMany({
      include: { pets: true },
    });

    return customers.map(CustomerMapper.toDomain);
  }

  async create(customer: Customer) {
    const raw = CustomerMapper.toPrisma(customer);
    const rawCustomerPets = customer.pets.map((p) =>
      PetMapper.toPrisma(p, false),
    );

    await this.prismaService.customer.create({
      data: {
        ...raw,
        pets: {
          createMany: {
            data: rawCustomerPets,
          },
        },
      },
    });
  }

  async save(customer: Customer): Promise<void> {
    const raw = CustomerMapper.toPrisma(customer);

    // 更新客户基本信息
    await this.prismaService.customer.update({
      where: {
        id: customer.id,
      },
      data: raw,
    });

    // 更新关联的宠物信息
    if (customer.pets && customer.pets.length > 0) {
      for (const pet of customer.pets) {
        await this.prismaService.pet.update({
          where: {
            id: pet.id,
          },
          data: PetMapper.toPrisma(pet, false), // false表示不包含ownerId
        });
      }
    }
  }

  async deleteById(id: string): Promise<void> {
    await this.prismaService.customer.delete({
      where: {
        id,
      },
    });
  }
}
