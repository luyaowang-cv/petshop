import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from '@app/repositories/appointment-repository';

@Injectable()
export class ListMyAppointmentsService {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(customerId: string) {
    const appointments =
      await this.appointmentRepository.findManyByCustomerId(customerId);

    return { appointments };
  }
}
