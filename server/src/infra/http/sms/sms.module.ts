import { Module } from '@nestjs/common';
import { SmsController } from './sms.controller';
import { DatabaseModule } from '@infra/database/database.module';
import { CryptographyModule } from '@infra/cryptography/cryptography.module';
import { SaveSmsConfigService } from '@app/use-cases/sms/save-sms-config.service';
import { GetSmsConfigService } from '@app/use-cases/sms/get-sms-config.service';
import { ListSmsRecordsService } from '@app/use-cases/sms/list-sms-records.service';
import { SendSmsService } from '@app/use-cases/sms/send-sms.service';
import { SendTestSmsService } from '@app/use-cases/sms/send-test-sms.service';
import { SmsProviderFactory } from '@infra/providers/sms-provider-factory';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [SmsController],
  providers: [
    SaveSmsConfigService,
    GetSmsConfigService,
    ListSmsRecordsService,
    SendSmsService,
    SendTestSmsService,
    SmsProviderFactory,
  ],
  exports: [
    SaveSmsConfigService,
    GetSmsConfigService,
    ListSmsRecordsService,
    SendSmsService,
    SendTestSmsService,
  ],
})
export class SmsModule {}
