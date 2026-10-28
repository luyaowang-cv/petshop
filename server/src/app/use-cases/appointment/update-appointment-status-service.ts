import { Injectable, Logger } from '@nestjs/common';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { PointsRuleRepository } from '@app/repositories/points-rule-repository';
import { PointsRecordRepository } from '@app/repositories/points-record-repository';
import { FinanceRecordRepository } from '@app/repositories/finance-record-repository';
import { AppointmentStatus } from '@app/entities/appointment';
import { PointsRecord, PointsAction } from '@app/entities/points-record';
import { FinanceRecord, FinanceType } from '@app/entities/finance-record';
import { EntityNotFound } from '../errors/entity-not-found';
import { SendSmsService } from '../sms/send-sms.service';
import { SmsScenario } from '@app/entities/sms-config';

type UpdateStatusRequest = {
  id: string;
  status: AppointmentStatus;
};

@Injectable()
export class UpdateAppointmentStatusService {
  private readonly logger = new Logger(UpdateAppointmentStatusService.name);

  constructor(
    private appointmentRepository: AppointmentRepository,
    private customerRepository: CustomerRepository,
    private pointsRuleRepository: PointsRuleRepository,
    private pointsRecordRepository: PointsRecordRepository,
    private financeRecordRepository: FinanceRecordRepository,
    private sendSmsService: SendSmsService,
  ) {}

  async execute(request: UpdateStatusRequest) {
    const appointment = await this.appointmentRepository.findById(request.id);

    if (!appointment) {
      throw new EntityNotFound('Appointment', request.id);
    }

    const oldStatus = appointment.status;
    appointment.status = request.status;

    await this.appointmentRepository.save(appointment);

    // 如果状态从非COMPLETED变为COMPLETED，处理财务逻辑
    if (
      oldStatus !== AppointmentStatus.COMPLETED &&
      request.status === AppointmentStatus.COMPLETED &&
      appointment.service
    ) {
      await this.handleCompletedAppointment(appointment);

      // 发送服务完成短信通知
      await this.sendCompletionSms(appointment);
    }

    return { appointment };
  }

  private async handleCompletedAppointment(appointment: any) {
    // 获取宠物的主人信息
    const pet = appointment.pet;
    if (!pet || !pet.ownerId) {
      console.log('预约没有关联客户，跳过财务处理');
      return;
    }

    const customer = await this.customerRepository.findById(pet.ownerId);
    if (!customer) {
      console.log('未找到客户，跳过财务处理');
      return;
    }

    const serviceAmount = appointment.service.value; // 服务价格（分）

    // 1. 更新客户累计消费
    customer.totalSpent += serviceAmount;

    // 2. 更新最近到店时间
    customer.lastVisitAt = new Date();

    // 3. 如果是洗护服务，更新宠物的最近洗护时间
    const isGroomingService =
      appointment.service.category === 'GROOMING' ||
      appointment.service.title.includes('洗护') ||
      appointment.service.title.includes('美容') ||
      appointment.service.title.includes('洗澡');

    if (isGroomingService) {
      const petToUpdate = customer.pets.find((p) => p.id === pet.id);
      if (petToUpdate) {
        petToUpdate.lastGroomingAt = new Date();
        console.log(
          `更新宠物${
            petToUpdate.name
          }的最近洗护时间: ${new Date().toISOString()}`,
        );
      } else {
        console.log(`未在客户的宠物列表中找到宠物ID: ${pet.id}`);
      }
    } else {
      console.log(
        `服务"${appointment.service.title}"不是洗护服务，跳过更新最近洗护时间`,
      );
    }

    // 4. 根据积分规则增加积分
    const pointsRule = await this.pointsRuleRepository.findActive();
    console.log('服务完成 - 积分规则:', pointsRule);
    console.log('服务金额（分）:', serviceAmount);

    if (pointsRule) {
      // 计算应得积分：服务金额（分）/ 规则金额（分）* 获得积分
      const earnedPoints = Math.floor(
        (serviceAmount / pointsRule.spendAmount) * pointsRule.earnPoints,
      );

      console.log(
        '计算公式:',
        `(${serviceAmount} / ${pointsRule.spendAmount}) * ${pointsRule.earnPoints} = ${earnedPoints}`,
      );

      if (earnedPoints > 0) {
        // 增加积分
        customer.memberPoints += earnedPoints;

        // 创建积分记录
        const pointsRecord = PointsRecord.create({
          customerId: customer.id,
          action: PointsAction.CONSUME,
          points: earnedPoints,
          balance: customer.memberPoints,
          reason: `服务消费获得积分 - 预约号：${appointment.id.substring(
            0,
            8,
          )}`,
          operator: '系统',
          createdAt: new Date(),
        });

        await this.pointsRecordRepository.create(pointsRecord);
      }
    } else {
      console.log('未找到激活的积分规则');
    }

    // 保存客户信息（包括宠物的更新）
    await this.customerRepository.save(customer);

    // 5. 创建财务记录
    const financeRecord = new FinanceRecord({
      type: FinanceType.INCOME,
      category: '服务收入',
      amount: serviceAmount,
      description: `${appointment.service.title} - 客户：${customer.name}`,
      date: new Date(),
    });

    await this.financeRecordRepository.create(financeRecord);

    console.log(
      `预约完成财务处理：客户${customer.name}，服务金额${
        serviceAmount / 100
      }元，累计消费${customer.totalSpent / 100}元`,
    );
  }

  private async sendCompletionSms(appointment: any) {
    try {
      // 获取客户信息
      const pet = appointment.pet;
      if (!pet || !pet.ownerId) {
        this.logger.warn('预约没有关联客户，跳过短信发送');
        return;
      }

      const customer = await this.customerRepository.findById(pet.ownerId);
      if (!customer || !customer.phone) {
        this.logger.warn('客户信息不完整或没有手机号，跳过短信发送');
        return;
      }

      const serviceAmount = appointment.service.value; // 服务价格（分）
      const amountInYuan = (serviceAmount / 100).toFixed(2); // 转换为元

      // 发送短信
      await this.sendSmsService.execute({
        phoneNumber: customer.phone,
        scenario: SmsScenario.APPOINTMENT_COMPLETE,
        templateVariables: {
          customer: customer.name,
          pet: pet.name,
          service: appointment.service.title,
          amount: amountInYuan,
        },
        customerId: customer.id,
        appointmentId: appointment.id,
        petId: pet.id,
      });

      this.logger.log(
        `服务完成短信已发送给客户 ${customer.name}（${this.maskPhone(
          customer.phone,
        )}）`,
      );
    } catch (error) {
      // 短信发送失败不应该影响主流程
      this.logger.error(`发送服务完成短信失败: ${error.message}`, error.stack);
    }
  }

  private maskPhone(phone: string): string {
    if (phone.length !== 11) return phone;
    return `${phone.substring(0, 3)}****${phone.substring(7)}`;
  }
}
