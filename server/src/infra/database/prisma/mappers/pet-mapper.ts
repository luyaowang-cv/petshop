import { Pet, PetType, PetGender } from '@app/entities/pet';
import {
  Pet as RawPet,
  PetType as PrismaPetType,
  PetGender as PrismaGender,
} from '@prisma/client';

export class PetMapper {
  static toPrisma(pet: Pet, includeOwnerId: boolean | undefined = true) {
    return {
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      petType: pet.petType as PrismaPetType,
      gender: pet.gender as PrismaGender,
      birthday: pet.birthday,
      isNeutered: pet.isNeutered,
      lastGroomingAt: pet.lastGroomingAt,
      vaccineInfo: pet.vaccineInfo,
      allergyHistory: pet.allergyHistory,
      healthNotes: pet.healthNotes,
      imageUrl: pet.imageUrl,
      ownerId: includeOwnerId ? pet.ownerId : undefined,
    };
  }

  static toDomain(raw: RawPet) {
    return new Pet(
      {
        name: raw.name,
        breed: raw.breed,
        age: raw.age,
        petType: raw.petType as PetType,
        gender: raw.gender as PetGender,
        birthday: raw.birthday,
        isNeutered: raw.isNeutered,
        lastGroomingAt: raw.lastGroomingAt,
        vaccineInfo: raw.vaccineInfo,
        allergyHistory: raw.allergyHistory,
        healthNotes: raw.healthNotes,
        imageUrl: raw.imageUrl,
        ownerId: raw.ownerId,
      },
      raw.id,
    );
  }
}
