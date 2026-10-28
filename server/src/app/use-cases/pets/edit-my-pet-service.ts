import { PetType, PetGender } from '@app/entities/pet';
import { PetRepository } from '@app/repositories/pet-repository';
import { Injectable } from '@nestjs/common';
import { EntityNotFound } from '../errors/entity-not-found';
import { Forbidden } from '../errors/forbidden';

interface EditMyPetRequest {
  customerId: string;
  petId: string;
  body: {
    name: string;
    age: number;
    breed: string;
    petType: PetType;
    gender: PetGender;
    birthday?: string;
    isNeutered: boolean;
    lastGroomingAt?: string;
    vaccineInfo?: string;
    allergyHistory?: string;
    healthNotes?: string;
    imageUrl?: string | null;
  };
}

@Injectable()
export class EditMyPetService {
  constructor(private petRepository: PetRepository) {}

  async execute(request: EditMyPetRequest) {
    const pet = await this.petRepository.findById(request.petId);
    if (!pet) throw new EntityNotFound('Pet', request.petId);
    if (pet.ownerId !== request.customerId) throw new Forbidden();

    const {
      name,
      age,
      breed,
      petType,
      gender,
      birthday,
      isNeutered,
      lastGroomingAt,
      vaccineInfo,
      allergyHistory,
      healthNotes,
      imageUrl,
    } = request.body;

    pet.name = name;
    pet.age = age;
    pet.breed = breed;
    pet.petType = petType;
    pet.gender = gender;
    pet.birthday = birthday ? new Date(birthday) : null;
    pet.isNeutered = isNeutered;
    pet.lastGroomingAt = lastGroomingAt ? new Date(lastGroomingAt) : null;
    pet.vaccineInfo = vaccineInfo ?? null;
    pet.allergyHistory = allergyHistory ?? null;
    pet.healthNotes = healthNotes ?? null;
    if (imageUrl !== undefined) pet.imageUrl = imageUrl;

    await this.petRepository.save(pet);

    return { pet };
  }
}
