import { SmsRecord } from '@app/entities/sms-record';
import { SmsScenario } from '@app/entities/sms-config';
import { SmsStatus } from '@app/entities/sms-record';

export interface FindSmsRecordsParams {
  page?: number;
  pageSize?: number;
  phoneNumber?: string;
  scenario?: SmsScenario;
  status?: SmsStatus;
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
}

export interface FindSmsRecordsResult {
  records: SmsRecord[];
  total: number;
}

export abstract class SmsRecordRepository {
  abstract create(record: SmsRecord): Promise<SmsRecord>;
  abstract findMany(
    params: FindSmsRecordsParams,
  ): Promise<FindSmsRecordsResult>;
  abstract count(
    params?: Omit<FindSmsRecordsParams, 'page' | 'pageSize'>,
  ): Promise<number>;
}
