import { PointsRecord } from '../entities/points-record';

export abstract class PointsRecordRepository {
  abstract create(record: PointsRecord): Promise<void>;
  abstract findByCustomerId(customerId: string): Promise<PointsRecord[]>;
}
