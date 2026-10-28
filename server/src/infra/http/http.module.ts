import { Module } from '@nestjs/common';
import { AppointmentModule } from './appointment/appointment.module';
import { CustomerModule } from './customers/customer.module';
import { PetModule } from './pets/pet.module';
import { PetshopServiceModule } from './petshop-services/petshop-service.module';
import { SessionModule } from './session/session.module';
import { ProductModule } from './products/product.module';
import { ProductOrderModule } from './product-orders/product-order.module';
import { MemberModule } from './members/member.module';
import { StockRecordModule } from './stock-records/stock-record.module';
import { FinanceModule } from './finance/finance.module';
import { SmsModule } from './sms/sms.module';
import { MiniprogramModule } from './miniprogram/miniprogram.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    PetshopServiceModule,
    CustomerModule,
    PetModule,
    AppointmentModule,
    SessionModule,
    ProductModule,
    ProductOrderModule,
    MemberModule,
    StockRecordModule,
    FinanceModule,
    SmsModule,
    MiniprogramModule,
    UploadModule,
  ],
})
export class HttpModule {}
