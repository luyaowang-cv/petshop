import { PetType, PetGender } from '@app/entities/pet';
import { PetRepository } from '@app/repositories/pet-repository';
import { Injectable } from '@nestjs/common';
import { EntityNotFound } from '../errors/entity-not-found';

interface EditPetRequest {
  id: string;
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
    imageUrl?: string;
  };
}

@Injectable()
export class EditPetService {
  constructor(private petRepository: PetRepository) {}

  async execute(request: EditPetRequest) {
    const pet = await this.petRepository.findById(request.id);
    if (!pet) throw new EntityNotFound('Pet', request.id);

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
    pet.vaccineInfo = vaccineInfo;
    pet.allergyHistory = allergyHistory;
    pet.healthNotes = healthNotes;
    pet.imageUrl = imageUrl;

    await this.petRepository.save(pet);

    return { pet };
  }
}
