import {
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateProductOrderBody {
  @IsOptional()
  @IsString()
  customerId?: string; // 改为可选，支持散客交易

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[]; // 移除ArrayMinSize(1)，允许空数组（只有服务项目的情况）

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointsUsed?: number; // 使用的积分数量

  @IsOptional()
  @IsInt()
  @Min(0)
  balanceUsed?: number; // 使用的余额（分）
}
