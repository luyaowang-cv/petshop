import { Product } from '@app/entities/product';

export class ProductViewModel {
  static toHTTP(product: Product) {
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      status: product.status,
      description: product.description,
      imageUrl: product.imageUrl,
      supplierId: product.supplierId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      isLowStock: product.isLowStock,
    };
  }
}
