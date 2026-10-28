import { Injectable, Logger } from '@nestjs/common';
import {
  SmsProvider,
  SendSmsParams,
  SendSmsResult,
} from '../../app/providers/sms-provider';

@Injectable()
export class MockSmsProvider extends SmsProvider {
  private readonly logger = new Logger(MockSmsProvider.name);

  constructor(
    private readonly accessKeyId: string,
    private readonly accessKeySecret: string,
  ) {
    super();
  }

  async send(params: SendSmsParams): Promise<SendSmsResult> {
    const { phoneNumber, templateId, templateVariables, signName } = params;

    // Mask phone number for logging
    const maskedPhone = this.maskPhoneNumber(phoneNumber);

    // Simulate SMS sending with random success/failure
    const shouldSucceed = Math.random() > 0.1; // 90% success rate

    if (shouldSucceed) {
      const messageId = `mock-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      this.logger.log(
        `[MOCK SMS] Successfully sent to ${maskedPhone} | Template: ${templateId} | Sign: ${signName} | MessageID: ${messageId}`,
      );
      this.logger.debug(
        `[MOCK SMS] Template variables: ${JSON.stringify(templateVariables)}`,
      );

      return {
        success: true,
        messageId,
      };
    } else {
      const errorCode = 'MOCK_ERROR';
      const errorMessage = 'Mock SMS provider simulated failure';

      this.logger.warn(
        `[MOCK SMS] Failed to send to ${maskedPhone} | Error: ${errorMessage}`,
      );

      return {
        success: false,
        errorCode,
        errorMessage,
      };
    }
  }

  async validateCredentials(): Promise<boolean> {
    // Mock validation - always return true if credentials are provided
    const isValid =
      !!this.accessKeyId &&
      !!this.accessKeySecret &&
      this.accessKeyId.length > 0 &&
      this.accessKeySecret.length > 0;

    this.logger.log(
      `[MOCK SMS] Credentials validation: ${isValid ? 'VALID' : 'INVALID'}`,
    );

    return isValid;
  }

  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length !== 11) {
      return phoneNumber;
    }
    return `${phoneNumber.substring(0, 3)}****${phoneNumber.substring(7)}`;
  }
}
