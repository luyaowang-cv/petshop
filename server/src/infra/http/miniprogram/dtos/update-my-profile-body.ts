import { IsOptional, IsString } from 'class-validator';

export class UpdateMyProfileBody {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
