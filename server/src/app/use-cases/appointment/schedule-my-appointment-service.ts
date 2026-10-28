import { Injectable } from '@nestjs/common';
import { Appointment } from '@app/entities/appointment';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { PetRepository } from '@app/repositories/pet-repository';
import { PetshopServiceRepository } from '@app/repositories/petshop-service-repository';
import { EntityNotFound } from '../errors/entity-not-found';
import { Forbidden } from '../errors/forbidden';
import { BadRequest } from '../errors/bad-request';

interface ScheduleMyAppointmentRequest {
  customerId: string;
  petId: string;
  serviceId: string;
  appointmentTime: Date;
  customerNote?: string;
}

@Injectable()
export class ScheduleMyAppointmentService {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private petRepository: PetRepository,
    private petshopServiceRepository: PetshopServiceRepository,
  ) {}

  async execute(request: ScheduleMyAppointmentRequest) {
    const pet = await this.petRepository.findById(request.petId);
    if (!pet) throw new EntityNotFound('Pet', request.petId);
    if (pet.ownerId !== request.customerId) throw new Forbidden();

    const service = await this.petshopServiceRepository.findById(
      request.serviceId,
    );
    if (!service) throw new EntityNotFound('Service', request.serviceId);

    if (request.appointmentTime.getTime() <= Date.now()) {
      throw new BadRequest('预约时间必须晚于当前时间');
    }

    const appointment = new Appointment({
      petId: request.petId,
      serviceId: request.serviceId,
      appointmentTime: request.appointmentTime,
      customerNote: request.customerNote ?? null,
    });

    await this.appointmentRepository.create(appointment);

    return { appointment };
  }
}
