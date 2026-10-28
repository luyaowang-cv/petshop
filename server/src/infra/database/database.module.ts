import { Module } from '@nestjs/common';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { PetRepository } from '@app/repositories/pet-repository';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { ProductRepository } from '@app/repositories/product-repository';
import { ProductOrderRepository } from '@app/repositories/product-order-repository';
import { RechargeRecordRepository } from '@app/repositories/recharge-record-repository';
import { PointsRecordRepository } from '@app/repositories/points-record-repository';
import { PointsRuleRepository } from '@app/repositories/points-rule-repository';
import { StockRecordRepository } from '@app/repositories/stock-record-repository';
import { FinanceRecordRepository } from '@app/repositories/finance-record-repository';
import { SmsConfigRepository } from '@app/repositories/sms-config-repository';
import { SmsRecordRepository } from '@app/repositories/sms-record-repository';
import { PrismaService } from './prisma/prisma.service';
import { PrismaPetshopServiceRepository } from './prisma/repositories/prisma-petshop-service-repository';
import { PrismaCustomerRepository } from './prisma/repositories/prisma-customer-repository';
import { PrismaPetRepository } from './prisma/repositories/prisma-pet-repository';
import { PrismaAppointmentRepository } from './prisma/repositories/prisma-appointment-repository';
import { PrismaProductRepository } from './prisma/repositories/prisma-product-repository';
import { PrismaProductOrderRepository } from './prisma/repositories/prisma-product-order-repository';
import { PrismaRechargeRecordRepository } from './prisma/repositories/prisma-recharge-record-repository';
import { PrismaPointsRecordRepository } from './prisma/repositories/prisma-points-record-repository';
import { PrismaPointsRuleRepository } from './prisma/repositories/prisma-points-rule-repository';
import { PrismaStockRecordRepository } from './prisma/repositories/prisma-stock-record-repository';
import { PrismaFinanceRecordRepository } from './prisma/repositories/prisma-finance-record-repository';
import { PrismaSmsConfigRepository } from './prisma/repositories/prisma-sms-config-repository';
import { PrismaSmsRecordRepository } from './prisma/repositories/prisma-sms-record-repository';
import { UserRepository } from '@app/repositories/user-repository';
import { PrismaUserRepository } from './prisma/repositories/prisma-user-repository';
import { Paginator } from '@app/repositories/utils/pagination';
import { PrismaPaginator } from './prisma/repositories/utils/prisma-paginator';

@Module({
  providers: [
    PrismaService,
    {
      provide: Paginator,
      useClass: PrismaPaginator,
    },
    {
      provide: PetshopServiceRepository,
      useClass: PrismaPetshopServiceRepository,
    },
    {
      provide: CustomerRepository,
      useClass: PrismaCustomerRepository,
    },
    {
      provide: PetRepository,
      useClass: PrismaPetRepository,
    },
    {
      provide: AppointmentRepository,
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
    {
      provide: ProductOrderRepository,
      useClass: PrismaProductOrderRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: RechargeRecordRepository,
      useClass: PrismaRechargeRecordRepository,
    },
    {
      provide: PointsRecordRepository,
      useClass: PrismaPointsRecordRepository,
    },
    {
      provide: PointsRuleRepository,
      useClass: PrismaPointsRuleRepository,
    },
    {
      provide: StockRecordRepository,
      useClass: PrismaStockRecordRepository,
    },
    {
      provide: FinanceRecordRepository,
      useClass: PrismaFinanceRecordRepository,
    },
    {
      provide: SmsConfigRepository,
      useClass: PrismaSmsConfigRepository,
    },
    {
      provide: SmsRecordRepository,
      useClass: PrismaSmsRecordRepository,
    },
  ],
  exports: [
    PetshopServiceRepository,
    CustomerRepository,
    PetRepository,
    AppointmentRepository,
    ProductRepository,
    ProductOrderRepository,
    UserRepository,
    RechargeRecordRepository,
    PointsRecordRepository,
    PointsRuleRepository,
    StockRecordRepository,
    FinanceRecordRepository,
    SmsConfigRepository,
    SmsRecordRepository,
  ],
})
export class DatabaseModule {}
