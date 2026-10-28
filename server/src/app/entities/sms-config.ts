import { BaseEntity } from './base-entity';

export enum SmsProvider {
  ALIYUN = 'ALIYUN',
  TENCENT = 'TENCENT',
  HUAWEI = 'HUAWEI',
}

export enum SmsScenario {
  APPOINTMENT_CONFIRM = 'APPOINTMENT_CONFIRM',
  APPOINTMENT_REMIND = 'APPOINTMENT_REMIND',
  APPOINTMENT_COMPLETE = 'APPOINTMENT_COMPLETE',
  ORDER_CONFIRM = 'ORDER_CONFIRM',
  BALANCE_CHANGE = 'BALANCE_CHANGE',
  BIRTHDAY_GREETING = 'BIRTHDAY_GREETING',
  TEST = 'TEST',
}

interface SmsConfigProps {
  enabled: boolean;
  provider: SmsProvider;
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  appointmentConfirmTemplateId?: string | null;
  appointmentRemindTemplateId?: string | null;
  appointmentCompleteTemplateId?: string | null;
  orderConfirmTemplateId?: string | null;
  balanceChangeTemplateId?: string | null;
  birthdayGreetingTemplateId?: string | null;
  appointmentConfirmEnabled: boolean;
  appointmentRemindEnabled: boolean;
  appointmentCompleteEnabled: boolean;
  orderConfirmEnabled: boolean;
  balanceChangeEnabled: boolean;
  birthdayGreetingEnabled: boolean;
  appointmentRemindHours: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SmsConfig extends BaseEntity<SmsConfigProps> {
  constructor(props: SmsConfigProps, id?: string) {
    super(props, id);
    this.props = {
      ...props,
      appointmentConfirmTemplateId: props.appointmentConfirmTemplateId ?? null,
      appointmentRemindTemplateId: props.appointmentRemindTemplateId ?? null,
      appointmentCompleteTemplateId:
        props.appointmentCompleteTemplateId ?? null,
      orderConfirmTemplateId: props.orderConfirmTemplateId ?? null,
      balanceChangeTemplateId: props.balanceChangeTemplateId ?? null,
      birthdayGreetingTemplateId: props.birthdayGreetingTemplateId ?? null,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  public get enabled() {
    return this.props.enabled;
  }

  public set enabled(value: boolean) {
    this.props.enabled = value;
  }

  public get provider() {
    return this.props.provider;
  }

  public get accessKeyId() {
    return this.props.accessKeyId;
  }

  public get accessKeySecret() {
    return this.props.accessKeySecret;
  }

  public get signName() {
    return this.props.signName;
  }

  public get appointmentRemindHours() {
    return this.props.appointmentRemindHours;
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

  public isScenarioEnabled(scenario: SmsScenario): boolean {
    switch (scenario) {
      case SmsScenario.APPOINTMENT_CONFIRM:
        return this.props.appointmentConfirmEnabled;
      case SmsScenario.APPOINTMENT_REMIND:
        return this.props.appointmentRemindEnabled;
      case SmsScenario.APPOINTMENT_COMPLETE:
        return this.props.appointmentCompleteEnabled;
      case SmsScenario.ORDER_CONFIRM:
        return this.props.orderConfirmEnabled;
      case SmsScenario.BALANCE_CHANGE:
        return this.props.balanceChangeEnabled;
      case SmsScenario.BIRTHDAY_GREETING:
        return this.props.birthdayGreetingEnabled;
      case SmsScenario.TEST:
        return true;
      default:
        return false;
    }
  }

  public getTemplateId(scenario: SmsScenario): string | null {
    switch (scenario) {
      case SmsScenario.APPOINTMENT_CONFIRM:
        return this.props.appointmentConfirmTemplateId ?? null;
      case SmsScenario.APPOINTMENT_REMIND:
        return this.props.appointmentRemindTemplateId ?? null;
      case SmsScenario.APPOINTMENT_COMPLETE:
        return this.props.appointmentCompleteTemplateId ?? null;
      case SmsScenario.ORDER_CONFIRM:
        return this.props.orderConfirmTemplateId ?? null;
      case SmsScenario.BALANCE_CHANGE:
        return this.props.balanceChangeTemplateId ?? null;
      case SmsScenario.BIRTHDAY_GREETING:
        return this.props.birthdayGreetingTemplateId ?? null;
      default:
        return null;
    }
  }
}
