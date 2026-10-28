import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsInt,
  Min,
  MaxLength,
  IsOptional,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { ProductCategory } from '@app/entities/product';

export class CreateProductBody {
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString({ message: '商品名称必须是字符串' })
  @MaxLength(100, { message: '商品名称长度不能超过100个字符' })
  name: string;

  @IsEnum(ProductCategory, { message: '商品分类必须是有效的枚举值' })
  category: ProductCategory;

  @IsInt({ message: '售价必须是整数' })
  @Min(0, { message: '售价不能为负数' })
  price: number;

  @IsInt({ message: '成本必须是整数' })
  @Min(0, { message: '成本不能为负数' })
  cost: number;

  @IsInt({ message: '库存数量必须是整数' })
  @Min(0, { message: '库存数量不能为负数' })
  stock: number;

  @IsInt({ message: '最低库存预警必须是整数' })
  @Min(0, { message: '最低库存预警不能为负数' })
  minStock: number;

  @IsNotEmpty({ message: '单位不能为空' })
  @IsString({ message: '单位必须是字符串' })
  unit: string;

  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: '图片URL格式不正确' })
  imageUrl?: string;

  @IsOptional()
  @IsUUID('4', { message: '供应商ID格式不正确' })
  supplierId?: string;
}
