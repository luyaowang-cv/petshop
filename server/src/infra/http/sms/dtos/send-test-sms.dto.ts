import { IsString, Matches } from 'class-validator';

export class SendTestSmsDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;
}
