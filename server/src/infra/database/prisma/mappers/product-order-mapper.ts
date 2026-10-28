import {
  ProductOrder as PrismaProductOrder,
  ProductOrderItem as PrismaProductOrderItem,
  Product as PrismaProduct,
} from '@prisma/client';
import {
  ProductOrder,
  ProductOrderStatus,
} from 'src/app/entities/product-order';
import { ProductOrderItem } from 'src/app/entities/product-order-item';
import { ProductMapper } from './product-mapper';

type PrismaProductOrderWithItems = PrismaProductOrder & {
  items: (PrismaProductOrderItem & {
    product: PrismaProduct;
  })[];
};

export class ProductOrderMapper {
  static toDomain(raw: PrismaProductOrderWithItems): ProductOrder {
    const items = raw.items.map((item) =>
      ProductOrderItem.create(
        {
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          product: ProductMapper.toDomain(item.product),
          createdAt: item.createdAt,
        },
        item.id,
      ),
    );

    return ProductOrder.create(
      {
        customerId: raw.customerId || undefined, // 处理null值
        totalAmount: raw.totalAmount,
        status: raw.status as ProductOrderStatus,
        note: raw.note || undefined,
        items,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(order: ProductOrder) {
    return {
      id: order.id,
      customerId: order.customerId || null, // 处理undefined值
      totalAmount: order.totalAmount,
      status: order.status,
      note: order.note || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  static toPrismaItem(item: ProductOrderItem) {
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
      createdAt: item.createdAt,
    };
  }
}
