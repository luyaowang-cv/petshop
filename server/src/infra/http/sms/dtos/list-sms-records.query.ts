import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListSmsRecordsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum([
    'APPOINTMENT_CONFIRM',
    'APPOINTMENT_REMIND',
    'APPOINTMENT_COMPLETE',
    'ORDER_CONFIRM',
    'BALANCE_CHANGE',
    'BIRTHDAY_GREETING',
    'TEST',
  ])
  scenario?: string;

  @IsOptional()
  @IsEnum(['SUCCESS', 'FAILED'])
  status?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
