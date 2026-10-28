import { IsBoolean, IsInt, IsPositive } from 'class-validator';

export class UpdatePointsRuleBody {
  @IsInt()
  @IsPositive()
  spendAmount: number;

  @IsInt()
  @IsPositive()
  earnPoints: number;

  @IsBoolean()
  isActive: boolean;
}
