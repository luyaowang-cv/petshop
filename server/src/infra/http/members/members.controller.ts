import { Controller, Get, Put, Post, Body, Param } from '@nestjs/common';
import { ListRechargeRecordsService } from '@app/use-cases/member/list-recharge-records-service';
import { CreateRechargeRecordService } from '@app/use-cases/member/create-recharge-record-service';
import { ListPointsRecordsService } from '@app/use-cases/member/list-points-records-service';
import { CreatePointsRecordService } from '@app/use-cases/member/create-points-record-service';
import { GetPointsRuleService } from '@app/use-cases/member/get-points-rule-service';
import { UpdatePointsRuleService } from '@app/use-cases/member/update-points-rule-service';
import { RechargeRecordViewModel } from '../view-models/recharge-record-view-model';
import { PointsRecordViewModel } from '../view-models/points-record-view-model';
import { PointsRuleViewModel } from '../view-models/points-rule-view-model';
import { UpdatePointsRuleBody } from './dtos/update-points-rule-body';
import { CreateRechargeRecordBody } from './dtos/create-recharge-record-body';
import { CreatePointsRecordBody } from './dtos/create-points-record-body';

@Controller('members')
export class MembersController {
  constructor(
    private listRechargeRecordsService: ListRechargeRecordsService,
    private createRechargeRecordService: CreateRechargeRecordService,
    private listPointsRecordsService: ListPointsRecordsService,
    private createPointsRecordService: CreatePointsRecordService,
    private getPointsRuleService: GetPointsRuleService,
    private updatePointsRuleService: UpdatePointsRuleService,
  ) {}

  @Get(':customerId/recharge-records')
  async getRechargeRecords(@Param('customerId') customerId: string) {
    const { records } = await this.listRechargeRecordsService.execute({
      customerId,
    });

    return {
      records: records.map(RechargeRecordViewModel.toHTTP),
    };
  }

  @Post(':customerId/recharge-records')
  async createRechargeRecord(
    @Param('customerId') customerId: string,
    @Body() body: CreateRechargeRecordBody,
  ) {
    const { record } = await this.createRechargeRecordService.execute({
      customerId,
      amount: body.amount,
      note: body.note,
    });

    return {
      record: RechargeRecordViewModel.toHTTP(record),
    };
  }

  @Get(':customerId/points-records')
  async getPointsRecords(@Param('customerId') customerId: string) {
    const { records } = await this.listPointsRecordsService.execute({
      customerId,
    });

    return {
      records: records.map(PointsRecordViewModel.toHTTP),
    };
  }

  @Post(':customerId/points-records')
  async createPointsRecord(
    @Param('customerId') customerId: string,
    @Body() body: CreatePointsRecordBody,
  ) {
    const { record } = await this.createPointsRecordService.execute({
      customerId,
      points: body.points,
      action: body.action,
      reason: body.reason,
    });

    return {
      record: PointsRecordViewModel.toHTTP(record),
    };
  }

  @Get('points-rule')
  async getPointsRule() {
    const { rule } = await this.getPointsRuleService.execute();

    return {
      rule: rule ? PointsRuleViewModel.toHTTP(rule) : null,
    };
  }

  @Put('points-rule')
  async updatePointsRule(@Body() body: UpdatePointsRuleBody) {
    const { rule } = await this.updatePointsRuleService.execute(body);

    return {
      rule: PointsRuleViewModel.toHTTP(rule),
    };
  }
}
