import { Pet } from './pet';
import { BaseEntity } from './base-entity';

export enum MemberLevel {
  REGULAR = 'REGULAR',
  VIP = 'VIP',
}

export interface CustomerPet extends Omit<Pet, 'id' | 'ownerId'> {
  id?: string;
  ownerId?: string;
}

interface CustomerProps {
  name: string;
  phone: string;
  openid?: string | null;
  avatarUrl?: string | null;
  pets: Pet[] | CustomerPet[];
  notes?: string | null;
  lastVisitAt?: Date | null;
  totalSpent?: number;
  memberLevel?: MemberLevel;
  memberPoints?: number;
  memberBalance?: number;
  memberJoinedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer extends BaseEntity<CustomerProps> {
  constructor(props: CustomerProps, id?: string) {
    super(props, id);

    const customerPets = props.pets.map((pet) => {
      if (pet.id) return pet as Pet;

      return new Pet({ ...(pet as CustomerPet), ownerId: this.id });
    });
    this.props = {
      ...props,
      pets: customerPets,
      openid: props.openid ?? null,
      avatarUrl: props.avatarUrl ?? null,
      notes: props.notes ?? null,
      lastVisitAt: props.lastVisitAt ?? null,
      totalSpent: props.totalSpent ?? 0,
      memberLevel: props.memberLevel ?? MemberLevel.REGULAR,
      memberPoints: props.memberPoints ?? 0,
      memberBalance: props.memberBalance ?? 0,
      memberJoinedAt: props.memberJoinedAt ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public get name() {
    return this.props.name;
  }

  public set name(name: string) {
    this.props.name = name;
  }

  public get phone() {
    return this.props.phone;
  }

  public set phone(phone: string) {
    this.props.phone = phone;
  }

  public get openid() {
    return this.props.openid ?? null;
  }

  public set openid(openid: string | null) {
    this.props.openid = openid;
  }

  public get avatarUrl() {
    return this.props.avatarUrl ?? null;
  }

  public set avatarUrl(avatarUrl: string | null) {
    this.props.avatarUrl = avatarUrl;
  }

  public get pets() {
    return this.props.pets as Pet[];
  }

  public set pets(pets: Pet[]) {
    this.props.pets = pets;
  }

  public get memberLevel() {
    return this.props.memberLevel!;
  }

  public set memberLevel(level: MemberLevel) {
    this.props.memberLevel = level;
  }

  public get memberPoints() {
    return this.props.memberPoints!;
  }

  public set memberPoints(points: number) {
    this.props.memberPoints = points;
  }

  public get memberBalance() {
    return this.props.memberBalance!;
  }

  public set memberBalance(balance: number) {
    this.props.memberBalance = balance;
  }

  public get memberJoinedAt() {
    return this.props.memberJoinedAt ?? null;
  }

  public set memberJoinedAt(date: Date | null) {
    this.props.memberJoinedAt = date;
  }

  public get createdAt() {
    return this.props.createdAt!;
  }

  public get updatedAt() {
    return this.props.updatedAt!;
  }

  public set updatedAt(date: Date) {
    this.props.updatedAt = date;
  }

  public get notes() {
    return this.props.notes ?? null;
  }

  public set notes(notes: string | null) {
    this.props.notes = notes;
  }

  public get lastVisitAt() {
    return this.props.lastVisitAt ?? null;
  }

  public set lastVisitAt(date: Date | null) {
    this.props.lastVisitAt = date;
  }

  public get totalSpent() {
    return this.props.totalSpent!;
  }

  public set totalSpent(amount: number) {
    this.props.totalSpent = amount;
  }
}
