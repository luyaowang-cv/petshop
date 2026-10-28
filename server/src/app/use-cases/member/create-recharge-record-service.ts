import { Injectable } from '@nestjs/common';
import { RechargeRecordRepository } from '@app/repositories/recharge-record-repository';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { RechargeRecord } from '@app/entities/recharge-record';
import { EntityNotFound } from '../errors/entity-not-found';

interface CreateRechargeRecordRequest {
  customerId: string;
  amount: number; // 充值金额（分）
  note?: string;
}

interface CreateRechargeRecordResponse {
  record: RechargeRecord;
}

@Injectable()
export class CreateRechargeRecordService {
  constructor(
    private rechargeRecordRepository: RechargeRecordRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute(
    request: CreateRechargeRecordRequest,
  ): Promise<CreateRechargeRecordResponse> {
    const { customerId, amount, note } = request;

    // 检查客户是否存在
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new EntityNotFound('Customer', customerId);

    // 更新客户余额
    const newBalance = customer.memberBalance + amount;
    customer.memberBalance = newBalance;
    await this.customerRepository.save(customer);

    // 创建充值记录
    const record = RechargeRecord.create({
      customerId,
      amount,
      balance: newBalance,
      operator: null, // 可以后续添加操作员信息
      note: note || null,
      createdAt: new Date(),
    });

    await this.rechargeRecordRepository.create(record);

    return { record };
  }
}
