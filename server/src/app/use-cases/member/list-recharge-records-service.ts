import { Injectable } from '@nestjs/common';
import { RechargeRecordRepository } from '@app/repositories/recharge-record-repository';
import { RechargeRecord } from '@app/entities/recharge-record';

interface ListRechargeRecordsRequest {
  customerId: string;
}

interface ListRechargeRecordsResponse {
  records: RechargeRecord[];
}

@Injectable()
export class ListRechargeRecordsService {
  constructor(private rechargeRecordRepository: RechargeRecordRepository) {}

  async execute(
    request: ListRechargeRecordsRequest,
  ): Promise<ListRechargeRecordsResponse> {
    const { customerId } = request;

    const records =
      await this.rechargeRecordRepository.findByCustomerId(customerId);

    return { records };
  }
}
