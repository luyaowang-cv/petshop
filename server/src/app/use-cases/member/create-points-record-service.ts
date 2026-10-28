import { Injectable } from '@nestjs/common';
import { PointsRecordRepository } from '@app/repositories/points-record-repository';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { PointsRecord, PointsAction } from '@app/entities/points-record';
import { EntityNotFound } from '../errors/entity-not-found';

interface CreatePointsRecordRequest {
  customerId: string;
  points: number; // 积分数量
  action: PointsAction; // 操作类型
  reason?: string;
}

interface CreatePointsRecordResponse {
  record: PointsRecord;
}

@Injectable()
export class CreatePointsRecordService {
  constructor(
    private pointsRecordRepository: PointsRecordRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute(
    request: CreatePointsRecordRequest,
  ): Promise<CreatePointsRecordResponse> {
    const { customerId, points, action, reason } = request;

    // 检查客户是否存在
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new EntityNotFound('Customer', customerId);

    // 更新客户积分
    let newPoints = customer.memberPoints;
    if (action === PointsAction.ADD || action === PointsAction.CONSUME) {
      newPoints += points;
    } else if (
      action === PointsAction.DEDUCT ||
      action === PointsAction.EXPIRE
    ) {
      newPoints -= points;
      if (newPoints < 0) newPoints = 0;
    }

    customer.memberPoints = newPoints;
    await this.customerRepository.save(customer);

    // 创建积分记录
    const record = PointsRecord.create({
      customerId,
      points,
      action,
      balance: newPoints,
      reason: reason || null,
      operator: null, // 可以后续添加操作员信息
      createdAt: new Date(),
    });

    await this.pointsRecordRepository.create(record);

    return { record };
  }
}
