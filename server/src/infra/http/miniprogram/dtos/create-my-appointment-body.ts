import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMyAppointmentBody {
  @IsUUID()
  petId: string;

  @IsUUID()
  serviceId: string;

  @IsDate()
  @Type(() => Date)
  appointmentTime: Date;

  @IsOptional()
  @IsString()
  customerNote?: string;
}
