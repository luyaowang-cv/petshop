import { IsOptional, IsString } from 'class-validator';

export class AuthenticateCustomerBody {
  @IsString()
  code: string;

  @IsString()
  phoneCode: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
