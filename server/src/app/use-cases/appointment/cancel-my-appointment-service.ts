import { Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@app/entities/appointment';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { Forbidden } from '../errors/forbidden';
import { BadRequest } from '../errors/bad-request';

interface CancelMyAppointmentRequest {
  customerId: string;
  appointmentId: string;
}

@Injectable()
export class CancelMyAppointmentService {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(request: CancelMyAppointmentRequest) {
    const appointment = await this.appointmentRepository.findById(
      request.appointmentId,
    );
    if (!appointment) {
      throw new EntityNotFound('Appointment', request.appointmentId);
    }

    if (!appointment.pet || appointment.pet.ownerId !== request.customerId) {
      throw new Forbidden();
    }

    if (
      appointment.status !== AppointmentStatus.PENDING &&
      appointment.status !== AppointmentStatus.CONFIRMED
    ) {
      throw new BadRequest('当前状态不可取消');
    }

    appointment.status = AppointmentStatus.CANCELED;
    await this.appointmentRepository.save(appointment);

    return { appointment };
  }
}
