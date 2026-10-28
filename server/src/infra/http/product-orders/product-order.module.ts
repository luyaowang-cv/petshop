import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/infra/database/database.module';
import { ProductOrdersController } from './product-orders.controller';
import { CreateProductOrderService } from 'src/app/use-cases/product-order/create-product-order-service';
import { ListProductOrdersService } from 'src/app/use-cases/product-order/list-product-orders-service';
import { ShowProductOrderService } from 'src/app/use-cases/product-order/show-product-order-service';
import { UpdateProductOrderStatusService } from 'src/app/use-cases/product-order/update-product-order-status-service';
import { GetProductSalesStatisticsService } from 'src/app/use-cases/product-order/get-product-sales-statistics-service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductOrdersController],
  providers: [
    CreateProductOrderService,
    ListProductOrdersService,
    ShowProductOrderService,
    UpdateProductOrderStatusService,
    GetProductSalesStatisticsService,
  ],
})
export class ProductOrderModule {}
