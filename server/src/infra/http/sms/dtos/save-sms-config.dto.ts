import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SaveSmsConfigDto {
  @IsBoolean()
  enabled: boolean;

  @IsEnum(['ALIYUN', 'TENCENT', 'HUAWEI'])
  provider: string;

  @IsString()
  @IsNotEmpty()
  accessKeyId: string;

  @IsString()
  @IsNotEmpty()
  accessKeySecret: string;

  @IsString()
  @IsNotEmpty()
  signName: string;

  @IsOptional()
  @IsString()
  appointmentConfirmTemplateId?: string;

  @IsOptional()
  @IsString()
  appointmentRemindTemplateId?: string;

  @IsOptional()
  @IsString()
  appointmentCompleteTemplateId?: string;

  @IsOptional()
  @IsString()
  orderConfirmTemplateId?: string;

  @IsOptional()
  @IsString()
  balanceChangeTemplateId?: string;

  @IsOptional()
  @IsString()
  birthdayGreetingTemplateId?: string;

  @IsBoolean()
  appointmentConfirmEnabled: boolean;

  @IsBoolean()
  appointmentRemindEnabled: boolean;

  @IsBoolean()
  appointmentCompleteEnabled: boolean;

  @IsBoolean()
  orderConfirmEnabled: boolean;

  @IsBoolean()
  balanceChangeEnabled: boolean;

  @IsBoolean()
  birthdayGreetingEnabled: boolean;

  @IsInt()
  @Min(1)
  @Max(48)
  appointmentRemindHours: number;
}
