import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/database.module';
import { MembersController } from './members.controller';
import { ListRechargeRecordsService } from '@app/use-cases/member/list-recharge-records-service';
import { CreateRechargeRecordService } from '@app/use-cases/member/create-recharge-record-service';
import { ListPointsRecordsService } from '@app/use-cases/member/list-points-records-service';
import { CreatePointsRecordService } from '@app/use-cases/member/create-points-record-service';
import { GetPointsRuleService } from '@app/use-cases/member/get-points-rule-service';
import { UpdatePointsRuleService } from '@app/use-cases/member/update-points-rule-service';

@Module({
  imports: [DatabaseModule],
  controllers: [MembersController],
  providers: [
    ListRechargeRecordsService,
    CreateRechargeRecordService,
    ListPointsRecordsService,
    CreatePointsRecordService,
    GetPointsRuleService,
    UpdatePointsRuleService,
  ],
})
export class MemberModule {}
