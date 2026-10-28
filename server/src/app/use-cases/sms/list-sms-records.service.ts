import { Injectable } from '@nestjs/common';
import {
  SmsRecordRepository,
  FindSmsRecordsParams,
} from '@app/repositories/sms-record-repository';
import { SmsScenario } from '@app/entities/sms-config';
import { SmsStatus } from '@app/entities/sms-record';

@Injectable()
export class ListSmsRecordsService {
  constructor(private smsRecordRepository: SmsRecordRepository) {}

  async execute(params: FindSmsRecordsParams) {
    const result = await this.smsRecordRepository.findMany(params);

    return {
      records: result.records,
      total: result.total,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    };
  }
}
