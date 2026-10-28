import { Pet } from './pet';
import { PetshopService } from './petshop-service';
import { BaseEntity } from './base-entity';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
  DONE = 'DONE',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
}

interface AppointmentProps {
  petId: string;
  serviceId: string;
  appointmentTime: Date;
  status?: AppointmentStatus;
  rejectReason?: string | null;
  customerNote?: string | null;
  pet?: Pet;
  service?: PetshopService;
}

export class Appointment extends BaseEntity<AppointmentProps> {
  constructor(props: AppointmentProps, id?: string) {
    super({ ...props, status: props.status ?? AppointmentStatus.PENDING }, id);
  }

  public get petId() {
    return this.props.petId;
  }

  public get pet() {
    return this.props.pet;
  }

  public get status() {
    return this.props.status!;
  }

  public get serviceId() {
    return this.props.serviceId;
  }

  public get service() {
    return this.props.service;
  }

  public get appointmentTime() {
    return this.props.appointmentTime;
  }

  public get rejectReason() {
    return this.props.rejectReason ?? null;
  }

  public set rejectReason(rejectReason: string | null) {
    this.props.rejectReason = rejectReason;
  }

  public get customerNote() {
    return this.props.customerNote ?? null;
  }

  public set customerNote(customerNote: string | null) {
    this.props.customerNote = customerNote;
  }

  public set status(status: AppointmentStatus) {
    this.props.status = status;
  }
}
