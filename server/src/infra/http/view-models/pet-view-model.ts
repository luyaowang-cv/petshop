import { Pet } from '@app/entities/pet';

export class PetViewModel {
  static toHTTP(pet: Pet) {
    return {
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      age: pet.age,
      petType: pet.petType,
      gender: pet.gender,
      birthday: pet.birthday,
      isNeutered: pet.isNeutered,
      lastGroomingAt: pet.lastGroomingAt,
      vaccineInfo: pet.vaccineInfo,
      allergyHistory: pet.allergyHistory,
      healthNotes: pet.healthNotes,
      imageUrl: pet.imageUrl,
      ownerId: pet.ownerId,
    };
  }
}
