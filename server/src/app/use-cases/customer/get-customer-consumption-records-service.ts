import { Injectable } from '@nestjs/common';
import { ProductOrderRepository } from '@app/repositories/product-order-repository';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { ProductOrderStatus } from '@app/entities/product-order';
import { AppointmentStatus } from '@app/entities/appointment';

export interface ConsumptionRecord {
  id: string;
  type: 'PRODUCT' | 'SERVICE'; // 商品订单 or 服务订单
  date: Date;
  amount: number; // 金额（分）
  status: string;
  items: string[]; // 商品名称或服务名称列表
  note?: string;
}

export interface GetCustomerConsumptionRecordsRequest {
  customerId: string;
  page?: number;
  pageSize?: number;
}

export interface GetCustomerConsumptionRecordsResponse {
  records: ConsumptionRecord[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class GetCustomerConsumptionRecordsService {
  constructor(
    private productOrderRepository: ProductOrderRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute(
    request: GetCustomerConsumptionRecordsRequest,
  ): Promise<GetCustomerConsumptionRecordsResponse> {
    const { customerId, page = 1, pageSize = 20 } = request;

    // 获取商品订单：收银台下单是 CONFIRMED，订单页「完成」后是 COMPLETED，
    // 两者都属于已消费；PENDING / CANCELED 不计入
    const { orders: allProductOrders } =
      await this.productOrderRepository.findMany(
        { customerId },
        undefined,
        undefined,
      );
    const productOrders = allProductOrders.filter(
      (order) =>
        order.status === ProductOrderStatus.CONFIRMED ||
        order.status === ProductOrderStatus.COMPLETED,
    );

    // 获取所有已完成的预约
    const { data: allAppointments } =
      await this.appointmentRepository.findManyPaginated({
        status: AppointmentStatus.COMPLETED,
        page: 1,
        pageSize: 10000, // 获取所有数据
      });

    // 筛选属于该客户的预约（通过宠物的ownerId）
    const customerAppointments = allAppointments.filter(
      (appointment: any) =>
        appointment.pet && appointment.pet.ownerId === customerId,
    );

    // 合并并转换为统一格式
    const allRecords: ConsumptionRecord[] = [];

    // 添加商品订单记录
    productOrders.forEach((order) => {
      const items = order.items.map(
        (item) => `${item.product?.name || '商品'} x${item.quantity}`,
      );

      allRecords.push({
        id: order.id,
        type: 'PRODUCT',
        date: order.createdAt,
        amount: order.totalAmount,
        status: this.translateProductOrderStatus(order.status),
        items,
        note: order.note || undefined,
      });
    });

    // 添加服务订单记录
    customerAppointments.forEach((appointment: any) => {
      if (appointment.service) {
        const petName = appointment.pet?.name || '宠物';
        allRecords.push({
          id: appointment.id,
          type: 'SERVICE',
          date: appointment.appointmentTime,
          amount: appointment.service.value,
          status: this.translateAppointmentStatus(appointment.status),
          items: [`${appointment.service.title} (${petName})`],
          note: undefined,
        });
      }
    });

    // 按日期降序排序
    allRecords.sort((a, b) => b.date.getTime() - a.date.getTime());

    // 分页
    const total = allRecords.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedRecords = allRecords.slice(start, end);

    return {
      records: paginatedRecords,
      total,
      page,
      pageSize,
    };
  }

  private translateProductOrderStatus(status: ProductOrderStatus): string {
    const statusMap = {
      [ProductOrderStatus.PENDING]: '待处理',
      [ProductOrderStatus.CONFIRMED]: '已确认',
      [ProductOrderStatus.COMPLETED]: '已完成',
      [ProductOrderStatus.CANCELED]: '已取消',
    };
    return statusMap[status] || status;
  }

  private translateAppointmentStatus(status: AppointmentStatus): string {
    const statusMap = {
      [AppointmentStatus.PENDING]: '待确认',
      [AppointmentStatus.CONFIRMED]: '已确认',
      [AppointmentStatus.REJECTED]: '已拒绝',
      [AppointmentStatus.DONE]: '已完成',
      [AppointmentStatus.PENDING_PAYMENT]: '待支付',
      [AppointmentStatus.COMPLETED]: '已完成',
      [AppointmentStatus.CANCELED]: '已取消',
    };
    return statusMap[status] || status;
  }
}
