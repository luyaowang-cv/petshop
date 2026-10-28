import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@infra/auth/jwt-auth.guard';
import { SaveSmsConfigDto } from './dtos/save-sms-config.dto';
import { SendTestSmsDto } from './dtos/send-test-sms.dto';
import { ListSmsRecordsQuery } from './dtos/list-sms-records.query';
import { SaveSmsConfigService } from '@app/use-cases/sms/save-sms-config.service';
import { GetSmsConfigService } from '@app/use-cases/sms/get-sms-config.service';
import { ListSmsRecordsService } from '@app/use-cases/sms/list-sms-records.service';
import { SendTestSmsService } from '@app/use-cases/sms/send-test-sms.service';
import { SmsConfigViewModel } from './view-models/sms-config.view-model';
import { SmsRecordViewModel } from './view-models/sms-record.view-model';

@Controller('sms')
@UseGuards(JwtAuthGuard)
export class SmsController {
  constructor(
    private saveSmsConfigService: SaveSmsConfigService,
    private getSmsConfigService: GetSmsConfigService,
    private listSmsRecordsService: ListSmsRecordsService,
    private sendTestSmsService: SendTestSmsService,
  ) {}

  @Post('config')
  async saveConfig(@Body() body: SaveSmsConfigDto) {
    const config = await this.saveSmsConfigService.execute(body);
    return { config: SmsConfigViewModel.toHTTP(config) };
  }

  @Get('config')
  async getConfig() {
    const config = await this.getSmsConfigService.execute();
    return { config: config ? SmsConfigViewModel.toHTTP(config) : null };
  }

  @Post('send-test')
  async sendTest(@Body() body: SendTestSmsDto) {
    const result = await this.sendTestSmsService.execute({
      phoneNumber: body.phoneNumber,
    });
    return result;
  }

  @Get('records')
  async listRecords(@Query() query: ListSmsRecordsQuery) {
    const result = await this.listSmsRecordsService.execute({
      page: query.page,
      pageSize: query.pageSize,
      phoneNumber: query.phoneNumber,
      scenario: query.scenario as any,
      status: query.status as any,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });

    return {
      records: result.records.map(SmsRecordViewModel.toHTTP),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }
}
