import { Length, Max, Min, IsInt, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ServiceCategory {
  GROOMING = 'GROOMING',
  MEDICAL = 'MEDICAL',
  BOARDING = 'BOARDING',
}

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreatePetshopServiceBody {
  @Length(1, 100)
  title: string;

  @Length(0, 500)
  description: string;

  @IsEnum(ServiceCategory)
  category: ServiceCategory;

  @Min(1)
  @Max(1_000_000_000) // max of 1_000_000_000 in cents --> 10_000_000 yuan
  @IsInt()
  value: number;

  @Min(1)
  @Max(24 * 60 * 60) // MAX of 86400 seconds --> 24h * 60min * 60s
  @IsInt()
  duration: number;

  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
