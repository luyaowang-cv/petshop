import { BaseEntity } from './base-entity';

export enum PetType {
  CAT = 'CAT',
  DOG = 'DOG',
  OTHER = 'OTHER',
}

export enum PetGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
}

export interface PetProps {
  name: string;
  age: number;
  breed: string;
  petType: PetType;
  gender: PetGender;
  birthday?: Date | null;
  isNeutered: boolean;
  lastGroomingAt?: Date | null;
  // 健康信息
  vaccineInfo?: string | null;
  allergyHistory?: string | null;
  healthNotes?: string | null;
  imageUrl?: string | null;
  ownerId: string;
}

export class Pet extends BaseEntity<PetProps> {
  public get name() {
    return this.props.name;
  }

  public set name(name: string) {
    this.props.name = name;
  }

  public get age() {
    return this.props.age;
  }

  public set age(age: number) {
    this.props.age = age;
  }

  public get breed() {
    return this.props.breed;
  }

  public set breed(breed: string) {
    this.props.breed = breed;
  }

  public get petType() {
    return this.props.petType;
  }

  public set petType(petType: PetType) {
    this.props.petType = petType;
  }

  public get gender() {
    return this.props.gender;
  }

  public set gender(gender: PetGender) {
    this.props.gender = gender;
  }

  public get birthday() {
    return this.props.birthday;
  }

  public set birthday(birthday: Date | null | undefined) {
    this.props.birthday = birthday;
  }

  public get isNeutered() {
    return this.props.isNeutered;
  }

  public set isNeutered(isNeutered: boolean) {
    this.props.isNeutered = isNeutered;
  }

  public get lastGroomingAt() {
    return this.props.lastGroomingAt;
  }

  public set lastGroomingAt(lastGroomingAt: Date | null | undefined) {
    this.props.lastGroomingAt = lastGroomingAt;
  }

  public get vaccineInfo() {
    return this.props.vaccineInfo;
  }

  public set vaccineInfo(vaccineInfo: string | null | undefined) {
    this.props.vaccineInfo = vaccineInfo;
  }

  public get allergyHistory() {
    return this.props.allergyHistory;
  }

  public set allergyHistory(allergyHistory: string | null | undefined) {
    this.props.allergyHistory = allergyHistory;
  }

  public get healthNotes() {
    return this.props.healthNotes;
  }

  public set healthNotes(healthNotes: string | null | undefined) {
    this.props.healthNotes = healthNotes;
  }

  public get imageUrl() {
    return this.props.imageUrl ?? null;
  }

  public set imageUrl(imageUrl: string | null | undefined) {
    this.props.imageUrl = imageUrl;
  }

  public get ownerId() {
    return this.props.ownerId;
  }

  public set ownerId(ownerId: string) {
    this.props.ownerId = ownerId;
  }
}
