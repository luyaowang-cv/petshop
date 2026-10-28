// SMS Provider Interface and Types

export interface SendSmsParams {
  phoneNumber: string;
  templateId: string;
  templateVariables: Record<string, string>;
  signName: string;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
}

export abstract class SmsProvider {
  abstract send(params: SendSmsParams): Promise<SendSmsResult>;
  abstract validateCredentials(): Promise<boolean>;
}
