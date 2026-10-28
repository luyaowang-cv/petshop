import { IsString, IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { StockInType } from 'src/app/entities/stock-record';

export class CreateStockRecordBody {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(StockInType)
  type: StockInType;

  @IsOptional()
  @IsInt()
  @Min(0)
  cost?: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsString()
  operator: string;

  @IsOptional()
  @IsString()
  note?: string;
}
