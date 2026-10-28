import { Injectable } from '@nestjs/common';
import { StockRecord, StockInType } from 'src/app/entities/stock-record';
import { StockRecordRepository } from 'src/app/repositories/stock-record-repository';
import { ProductRepository } from 'src/app/repositories/product-repository';
import { EntityNotFound } from '../errors/entity-not-found';

interface CreateStockRecordRequest {
  productId: string;
  quantity: number;
  type: StockInType;
  cost?: number;
  supplier?: string;
  operator: string;
  note?: string;
}

interface CreateStockRecordResponse {
  stockRecord: StockRecord;
}

@Injectable()
export class CreateStockRecordService {
  constructor(
    private stockRecordRepository: StockRecordRepository,
    private productRepository: ProductRepository,
  ) {}

  async execute(
    request: CreateStockRecordRequest,
  ): Promise<CreateStockRecordResponse> {
    const { productId, quantity, type, cost, supplier, operator, note } =
      request;

    // 验证商品是否存在
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new EntityNotFound('商品不存在');
    }

    // 使用提供的成本或商品默认成本
    const actualCost = cost !== undefined && cost > 0 ? cost : product.cost;

    // 计算总成本
    const totalCost = quantity * actualCost;

    // 创建入库记录
    const stockRecord = new StockRecord({
      productId,
      quantity,
      type,
      cost: actualCost,
      totalCost,
      supplier: supplier || null,
      operator,
      note: note || null,
      createdAt: new Date(),
    });

    await this.stockRecordRepository.create(stockRecord);

    // 更新商品库存
    product.addStock(quantity);

    // 如果提供了新的成本价，更新商品成本
    if (cost !== undefined && cost > 0 && cost !== product.cost) {
      product.updateCost(cost);
    }

    await this.productRepository.save(product);

    return {
      stockRecord,
    };
  }
}
