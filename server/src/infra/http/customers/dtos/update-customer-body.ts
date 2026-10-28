import { MemberLevel } from '@app/entities/customer';
import {
  Length,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

export class UpdateCustomerBody {
  @Length(1, 60)
  name: string;

  @Length(8, 60)
  phone: string;

  @IsOptional()
  @IsEnum(MemberLevel)
  memberLevel?: MemberLevel;

  @IsOptional()
  @IsInt()
  @Min(0)
  memberPoints?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  memberBalance?: number;

  @IsOptional()
  @IsDateString()
  memberJoinedAt?: string;
}
