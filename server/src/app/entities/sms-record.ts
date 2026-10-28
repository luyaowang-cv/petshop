import { BaseEntity } from './base-entity';
import { SmsScenario } from './sms-config';

export enum SmsStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

interface SmsRecordProps {
  phoneNumber: string;
  scenario: SmsScenario;
  templateId: string;
  templateContent?: string | null;
  status: SmsStatus;
  messageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  sentAt?: Date;
  customerId?: string | null;
  appointmentId?: string | null;
  orderId?: string | null;
  petId?: string | null;
}

export class SmsRecord extends BaseEntity<SmsRecordProps> {
  constructor(props: SmsRecordProps, id?: string) {
    super(props, id);
    this.props = {
      ...props,
      templateContent: props.templateContent ?? null,
      messageId: props.messageId ?? null,
      errorCode: props.errorCode ?? null,
      errorMessage: props.errorMessage ?? null,
      sentAt: props.sentAt ?? new Date(),
      customerId: props.customerId ?? null,
      appointmentId: props.appointmentId ?? null,
      orderId: props.orderId ?? null,
      petId: props.petId ?? null,
    };
  }

  static create(params: SmsRecordProps): SmsRecord {
    return new SmsRecord(params);
  }

  public get phoneNumber() {
    return this.props.phoneNumber;
  }

  public get scenario() {
    return this.props.scenario;
  }

  public get templateId() {
    return this.props.templateId;
  }

  public get templateContent() {
    return this.props.templateContent ?? null;
  }

  public get status() {
    return this.props.status;
  }

  public get messageId() {
    return this.props.messageId ?? null;
  }

  public get errorCode() {
    return this.props.errorCode ?? null;
  }

  public get errorMessage() {
    return this.props.errorMessage ?? null;
  }

  public get sentAt() {
    return this.props.sentAt!;
  }

  public get customerId() {
    return this.props.customerId ?? null;
  }

  public get appointmentId() {
    return this.props.appointmentId ?? null;
  }

  public get orderId() {
    return this.props.orderId ?? null;
  }

  public get petId() {
    return this.props.petId ?? null;
  }

  public getMaskedPhoneNumber(): string {
    const phone = this.props.phoneNumber;
    if (phone.length !== 11) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  }

  public isSuccess(): boolean {
    return this.props.status === SmsStatus.SUCCESS;
  }
}
