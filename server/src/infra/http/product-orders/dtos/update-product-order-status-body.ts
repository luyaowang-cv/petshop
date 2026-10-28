import { IsEnum } from 'class-validator';
import { ProductOrderStatus } from 'src/app/entities/product-order';

export class UpdateProductOrderStatusBody {
  @IsEnum(ProductOrderStatus)
  status: ProductOrderStatus;
}
