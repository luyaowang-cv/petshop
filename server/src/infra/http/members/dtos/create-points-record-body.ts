import { IsInt, Min, IsEnum, IsOptional, IsString } from 'class-validator';

export enum PointsAction {
  ADD = 'ADD',
  DEDUCT = 'DEDUCT',
  CONSUME = 'CONSUME',
  EXPIRE = 'EXPIRE',
}

export class CreatePointsRecordBody {
  @IsInt()
  @Min(1)
  points: number; // 积分数量

  @IsEnum(PointsAction)
  action: PointsAction; // 操作类型

  @IsOptional()
  @IsString()
  reason?: string; // 原因说明
}
