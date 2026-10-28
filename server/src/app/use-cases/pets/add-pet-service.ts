import { Pet, PetType, PetGender } from '@app/entities/pet';
import { CustomerRepository } from '@app/repositories/customer-repository';
import { PetRepository } from '@app/repositories/pet-repository';
import { Injectable } from '@nestjs/common';
import { EntityNotFound } from '../errors/entity-not-found';

interface AddPetRequest {
  name: string;
  age: number;
  breed: string;
  petType?: PetType;
  gender?: PetGender;
  birthday?: string;
  isNeutered?: boolean;
  lastGroomingAt?: string;
  vaccineInfo?: string;
  allergyHistory?: string;
  healthNotes?: string;
  imageUrl?: string;
  ownerId: string;
}

@Injectable()
export class AddPetService {
  constructor(
    private petRepository: PetRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute(request: AddPetRequest) {
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
      ownerId,
    } = request;

    const client = await this.customerRepository.findById(ownerId);

    if (!client) {
      throw new EntityNotFound('Customer', ownerId);
    }

    const pet = new Pet({
      name,
      age,
      breed,
      petType: petType || PetType.OTHER, // 默认为OTHER
      gender: gender || PetGender.UNKNOWN, // 默认为UNKNOWN
      birthday: birthday ? new Date(birthday) : null,
      isNeutered: isNeutered ?? false, // 默认为false
      lastGroomingAt: lastGroomingAt ? new Date(lastGroomingAt) : null,
      vaccineInfo: vaccineInfo || null,
      allergyHistory: allergyHistory || null,
      healthNotes: healthNotes || null,
      imageUrl: imageUrl || null,
      ownerId,
    });

    await this.petRepository.create(pet);

    return {
      pet,
    };
  }
}
