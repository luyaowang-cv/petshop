import { Injectable } from '@nestjs/common';
import {
  ProductOrder,
  ProductOrderStatus,
} from 'src/app/entities/product-order';
import { ProductOrderItem } from 'src/app/entities/product-order-item';
import { ProductOrderRepository } from 'src/app/repositories/product-order-repository';
import { ProductRepository } from 'src/app/repositories/product-repository';
import { CustomerRepository } from 'src/app/repositories/customer-repository';
import { PointsRuleRepository } from 'src/app/repositories/points-rule-repository';
import { PointsRecordRepository } from 'src/app/repositories/points-record-repository';
import { FinanceRecordRepository } from 'src/app/repositories/finance-record-repository';
import { PointsRecord, PointsAction } from 'src/app/entities/points-record';
import { FinanceRecord, FinanceType } from 'src/app/entities/finance-record';

interface CreateProductOrderRequest {
  customerId?: string; // 可选，支持散客
  items: {
    productId: string;
    quantity: number;
  }[];
  note?: string;
  pointsUsed?: number; // 使用的积分数量
  balanceUsed?: number; // 使用的余额（分）
}

interface CreateProductOrderResponse {
  order: ProductOrder;
}

@Injectable()
export class CreateProductOrderService {
  constructor(
    private productOrderRepository: ProductOrderRepository,
    private productRepository: ProductRepository,
    private customerRepository: CustomerRepository,
    private pointsRuleRepository: PointsRuleRepository,
    private pointsRecordRepository: PointsRecordRepository,
    private financeRecordRepository: FinanceRecordRepository,
  ) {}

  async execute(
    request: CreateProductOrderRequest,
  ): Promise<CreateProductOrderResponse> {
    const {
      customerId,
      items: requestItems,
      note,
      pointsUsed,
      balanceUsed,
    } = request;

    // 验证商品并计算金额
    const orderItems: ProductOrderItem[] = [];
    let totalAmount = 0;

    // 只有当items不为空时才处理商品
    if (requestItems && requestItems.length > 0) {
      for (const item of requestItems) {
        const product = await this.productRepository.findById(item.productId);

        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        const orderItem = ProductOrderItem.create({
          orderId: '', // 将在创建订单后设置
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          subtotal,
          product,
          createdAt: new Date(),
        });

        orderItems.push(orderItem);
      }
    }

    // 如果totalAmount为0（只有服务项目），允许创建纯服务订单
    if (totalAmount === 0 && (!requestItems || requestItems.length === 0)) {
      console.log('创建纯服务订单，商品金额为0');
    }

    // 创建订单（收银台直接创建已支付状态的订单）
    const order = ProductOrder.create({
      customerId,
      totalAmount,
      status: ProductOrderStatus.CONFIRMED, // 收银台创建的订单直接为已支付状态
      note,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 设置订单项的orderId
    orderItems.forEach((item) => {
      item.orderId = order.id;
    });

    order.items = orderItems;

    // 保存订单
    await this.productOrderRepository.create(order);

    // 更新库存（只在有商品时）
    if (requestItems && requestItems.length > 0) {
      for (const item of requestItems) {
        const product = await this.productRepository.findById(item.productId);
        if (product) {
          product.stock -= item.quantity;
          await this.productRepository.save(product);
        }
      }
    }

    // 如果是会员订单，更新会员信息
    if (customerId) {
      const customer = await this.customerRepository.findById(customerId);
      if (customer) {
        // 1. 如果使用了余额支付，扣除余额
        if (balanceUsed && balanceUsed > 0) {
          if (customer.memberBalance < balanceUsed) {
            throw new Error('余额不足');
          }
          customer.memberBalance -= balanceUsed;
        }

        // 2. 更新累计消费
        customer.totalSpent += totalAmount;

        // 3. 更新最近到店时间
        customer.lastVisitAt = new Date();

        // 4. 如果使用了积分兑换，扣除积分
        if (pointsUsed && pointsUsed > 0) {
          if (customer.memberPoints < pointsUsed) {
            throw new Error('积分不足');
          }

          // 扣除积分
          customer.memberPoints -= pointsUsed;

          // 创建积分扣除记录
          const deductRecord = PointsRecord.create({
            customerId: customer.id,
            action: PointsAction.DEDUCT,
            points: pointsUsed,
            balance: customer.memberPoints,
            reason: `积分兑换礼品 - 订单号：${order.id.substring(0, 8)}`,
            operator: '系统',
            createdAt: new Date(),
          });

          await this.pointsRecordRepository.create(deductRecord);
        }

        // 5. 根据积分规则增加积分
        const pointsRule = await this.pointsRuleRepository.findActive();
        console.log('积分规则:', pointsRule); // 调试日志
        console.log('订单金额（分）:', totalAmount); // 调试日志

        if (pointsRule) {
          // 计算应得积分：消费金额（分）/ 规则金额（分）* 获得积分
          const earnedPoints = Math.floor(
            (totalAmount / pointsRule.spendAmount) * pointsRule.earnPoints,
          );

          console.log(
            '计算公式:',
            `(${totalAmount} / ${pointsRule.spendAmount}) * ${pointsRule.earnPoints} = ${earnedPoints}`,
          ); // 调试日志

          if (earnedPoints > 0) {
            // 增加积分
            customer.memberPoints += earnedPoints;

            // 创建积分记录
            const pointsRecord = PointsRecord.create({
              customerId: customer.id,
              action: PointsAction.CONSUME,
              points: earnedPoints,
              balance: customer.memberPoints,
              reason: `消费获得积分 - 订单号：${order.id.substring(0, 8)}`,
              operator: '系统',
              createdAt: new Date(),
            });

            await this.pointsRecordRepository.create(pointsRecord);
          }
        } else {
          console.log('未找到激活的积分规则'); // 调试日志
        }

        // 保存客户信息
        await this.customerRepository.save(customer);

        // 6. 创建财务记录
        const financeRecord = new FinanceRecord({
          type: FinanceType.INCOME,
          category: '商品销售',
          amount: totalAmount,
          description: `订单号：${order.id.substring(0, 8)} - 客户：${
            customer.name
          }`,
          date: new Date(),
        });

        await this.financeRecordRepository.create(financeRecord);
      }
    } else if (totalAmount > 0) {
      // 散客订单也创建财务记录
      const financeRecord = new FinanceRecord({
        type: FinanceType.INCOME,
        category: '商品销售',
        amount: totalAmount,
        description: `订单号：${order.id.substring(0, 8)} - 散客`,
        date: new Date(),
      });

      await this.financeRecordRepository.create(financeRecord);
    }

    return { order };
  }
}
