import {
  Length,
  IsInt,
  Min,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  IsString,
} from 'class-validator';

export enum PetType {
  CAT = 'CAT',
  DOG = 'DOG',
  OTHER = 'OTHER',
}

export enum PetGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

class PetBodyDTO {
  @Length(1, 60)
  name: string;

  @Length(1, 60)
  breed: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsEnum(PetType)
  petType: PetType;

  @IsEnum(PetGender)
  gender: PetGender;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsBoolean()
  isNeutered: boolean;

  @IsOptional()
  @IsDateString()
  lastGroomingAt?: string;

  @IsOptional()
  @IsString()
  vaccineInfo?: string;

  @IsOptional()
  @IsString()
  allergyHistory?: string;

  @IsOptional()
  @IsString()
  healthNotes?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CreatePetBody extends PetBodyDTO {
  @IsUUID()
  ownerId: string;
}

// 创建客户时添加宠物的简化DTO（只需要基本信息）
export class CreateCustomerPetBody {
  @Length(1, 60)
  name: string;

  @Length(1, 60)
  breed: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsOptional()
  @IsEnum(PetType)
  petType?: PetType;

  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  @IsBoolean()
  isNeutered?: boolean;

  @IsOptional()
  @IsDateString()
  lastGroomingAt?: string;

  @IsOptional()
  @IsString()
  vaccineInfo?: string;

  @IsOptional()
  @IsString()
  allergyHistory?: string;

  @IsOptional()
  @IsString()
  healthNotes?: string;
}

export class UpdatePetBody extends PetBodyDTO {}
