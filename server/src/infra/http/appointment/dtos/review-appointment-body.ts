import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewAppointmentBody {
  @IsIn(['CONFIRM', 'REJECT'])
  action: 'CONFIRM' | 'REJECT';

  @IsOptional()
  @IsString()
  rejectReason?: string;
}
