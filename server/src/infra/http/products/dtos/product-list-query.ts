import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory } from '@app/entities/product';

export class ProductListQueryDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  @Max(10000, { message: '每页数量不能超过10000' })
  pageSize?: number = 10;

  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  search?: string;

  @IsOptional()
  @IsEnum(ProductCategory, { message: '商品分类必须是有效的枚举值' })
  category?: ProductCategory;

  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortField?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: '排序顺序必须是asc或desc' })
  sortOrder?: 'asc' | 'desc';
}
