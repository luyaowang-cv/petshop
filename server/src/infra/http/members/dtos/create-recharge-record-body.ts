import { IsInt, Min, IsOptional, IsString } from 'class-validator';

export class CreateRechargeRecordBody {
  @IsInt()
  @Min(1)
  amount: number; // 充值金额（分）

  @IsOptional()
  @IsString()
  note?: string; // 备注
}
