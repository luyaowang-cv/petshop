import { ProductOrder } from 'src/app/entities/product-order';
import { ProductOrderItem } from 'src/app/entities/product-order-item';

class ProductOrderItemViewModel {
  static toHTTP(item: ProductOrderItem) {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.product?.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      createdAt: item.createdAt,
    };
  }
}

export class ProductOrderViewModel {
  static toHTTP(order: ProductOrder) {
    return {
      id: order.id,
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      status: order.status,
      note: order.note,
      items: order.items.map((item) => ProductOrderItemViewModel.toHTTP(item)),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
