import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/database.module';
import { ProductsController } from './products.controller';
import { CreateProductService } from '@app/use-cases/product/create-product-service';
import { ListProductsService } from '@app/use-cases/product/list-products-service';
import { ShowProductService } from '@app/use-cases/product/show-product-service';
import { UpdateProductService } from '@app/use-cases/product/update-product-service';
import { DeleteProductService } from '@app/use-cases/product/delete-product-service';
import { ToggleProductStatusService } from '@app/use-cases/product/toggle-product-status-service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [
    CreateProductService,
    ListProductsService,
    ShowProductService,
    UpdateProductService,
    DeleteProductService,
    ToggleProductStatusService,
  ],
})
export class ProductModule {}
