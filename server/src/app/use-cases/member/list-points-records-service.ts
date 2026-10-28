import { Injectable } from '@nestjs/common';
import { PointsRecordRepository } from '@app/repositories/points-record-repository';
import { PointsRecord } from '@app/entities/points-record';

interface ListPointsRecordsRequest {
  customerId: string;
}

interface ListPointsRecordsResponse {
  records: PointsRecord[];
}

@Injectable()
export class ListPointsRecordsService {
  constructor(private pointsRecordRepository: PointsRecordRepository) {}

  async execute(
    request: ListPointsRecordsRequest,
  ): Promise<ListPointsRecordsResponse> {
    const { customerId } = request;

    const records =
      await this.pointsRecordRepository.findByCustomerId(customerId);

    return { records };
  }
}
