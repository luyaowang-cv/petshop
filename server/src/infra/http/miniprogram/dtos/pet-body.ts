import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { PetType, PetGender } from '@app/entities/pet';

class BaseMyPetBody {
  @Length(1, 60)
  name: string;

  @Length(1, 60)
  breed: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsOptional()
  @IsDateString()
  birthday?: string;

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

export class CreateMyPetBody extends BaseMyPetBody {
  @IsOptional()
  @IsEnum(PetType)
  petType?: PetType;

  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional()
  @IsBoolean()
  isNeutered?: boolean;
}

export class UpdateMyPetBody extends BaseMyPetBody {
  @IsEnum(PetType)
  petType: PetType;

  @IsEnum(PetGender)
  gender: PetGender;

  @IsBoolean()
  isNeutered: boolean;
}
