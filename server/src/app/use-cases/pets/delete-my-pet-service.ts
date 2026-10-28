import { PetRepository } from '@app/repositories/pet-repository';
import { AppointmentRepository } from '@app/repositories/appointment-repository';
import { Injectable } from '@nestjs/common';
import { EntityNotFound } from '../errors/entity-not-found';
import { Forbidden } from '../errors/forbidden';
import { InvalidDeleteOperation } from '../errors/invalid-delete-operation';

interface DeleteMyPetRequest {
  customerId: string;
  petId: string;
}

@Injectable()
export class DeleteMyPetService {
  constructor(
    private petRepository: PetRepository,
    private appointmentRepository: AppointmentRepository,
  ) {}

  async execute(request: DeleteMyPetRequest) {
    const pet = await this.petRepository.findById(request.petId);
    if (!pet) throw new EntityNotFound('Pet', request.petId);
    if (pet.ownerId !== request.customerId) throw new Forbidden();

    const petAppointments = await this.appointmentRepository.countByPetId(
      request.petId,
    );
    if (petAppointments > 0) {
      throw new InvalidDeleteOperation(
        `Pet with ${request.petId} has appointments.`,
      );
    }

    await this.petRepository.deleteById(request.petId);
  }
}
