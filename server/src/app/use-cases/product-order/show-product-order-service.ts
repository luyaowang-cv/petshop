import { Injectable } from '@nestjs/common';
import { ProductOrder } from 'src/app/entities/product-order';
import { ProductOrderRepository } from 'src/app/repositories/product-order-repository';
import { EntityNotFound } from '../errors/entity-not-found';

interface ShowProductOrderRequest {
  orderId: string;
}

interface ShowProductOrderResponse {
  order: ProductOrder;
}

@Injectable()
export class ShowProductOrderService {
  constructor(private productOrderRepository: ProductOrderRepository) {}

  async execute(
    request: ShowProductOrderRequest,
  ): Promise<ShowProductOrderResponse> {
    const { orderId } = request;

    const order = await this.productOrderRepository.findById(orderId);

    if (!order) {
      throw new EntityNotFound('Order not found');
    }

    return { order };
  }
}
