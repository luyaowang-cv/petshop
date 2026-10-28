import { Injectable } from '@nestjs/common';
import {
  ProductOrder,
  ProductOrderStatus,
} from 'src/app/entities/product-order';
import { ProductOrderRepository } from 'src/app/repositories/product-order-repository';
import { EntityNotFound } from '../errors/entity-not-found';

interface UpdateProductOrderStatusRequest {
  orderId: string;
  status: ProductOrderStatus;
}

interface UpdateProductOrderStatusResponse {
  order: ProductOrder;
}

@Injectable()
export class UpdateProductOrderStatusService {
  constructor(private productOrderRepository: ProductOrderRepository) {}

  async execute(
    request: UpdateProductOrderStatusRequest,
  ): Promise<UpdateProductOrderStatusResponse> {
    const { orderId, status } = request;

    const order = await this.productOrderRepository.findById(orderId);

    if (!order) {
      throw new EntityNotFound('Order not found');
    }

    order.status = status;

    await this.productOrderRepository.update(order);

    return { order };
  }
}
