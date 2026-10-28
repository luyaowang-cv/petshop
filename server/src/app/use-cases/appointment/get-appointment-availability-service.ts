import { Injectable } from '@nestjs/common';
import { BLOCKING_APPOINTMENT_STATUSES } from '@app/entities/appointment';
import { AppointmentRepository } from '@app/repositories/appointment-repository';

interface GetAppointmentAvailabilityRequest {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class GetAppointmentAvailabilityService {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(request: GetAppointmentAvailabilityRequest) {
    const appointments = await this.appointmentRepository.findManyByTimeRange(
      request.startDate,
      request.endDate,
    );

    // 只返回"占用中"状态的时间点（前端据此禁用对应时段）
    const bookedTimes = appointments
      .filter((a) => BLOCKING_APPOINTMENT_STATUSES.includes(a.status))
      .map((a) => a.appointmentTime.toISOString());

    return { bookedTimes };
  }
}
