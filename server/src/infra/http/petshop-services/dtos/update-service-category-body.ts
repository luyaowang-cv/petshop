import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateServiceCategoryBody {
  @IsOptional()
  @Length(1, 20)
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
