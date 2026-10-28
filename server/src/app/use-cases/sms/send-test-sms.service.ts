import { Injectable, Logger } from '@nestjs/common';
import { SendSmsService } from './send-sms.service';
import { SmsScenario } from '../../entities/sms-config';
import { SmsStatus } from '../../entities/sms-record';

export interface SendTestSmsRequest {
  phoneNumber: string;
}

export interface SendTestSmsResponse {
  success: boolean;
  message: string;
  messageId?: string;
  sentAt: Date;
}

@Injectable()
export class SendTestSmsService {
  private readonly logger = new Logger(SendTestSmsService.name);

  constructor(private readonly sendSmsService: SendSmsService) {}

  async execute(request: SendTestSmsRequest): Promise<SendTestSmsResponse> {
    const { phoneNumber } = request;

    // Validate phone number format
    if (!this.isValidPhoneNumber(phoneNumber)) {
      return {
        success: false,
        message: '手机号格式不正确，请输入11位中国大陆手机号',
        sentAt: new Date(),
      };
    }

    try {
      // Send test SMS with predefined template variables
      const smsRecord = await this.sendSmsService.execute({
        phoneNumber,
        scenario: SmsScenario.TEST,
        templateVariables: {
          code: this.generateTestCode(),
        },
      });

      if (smsRecord.status === SmsStatus.SUCCESS) {
        this.logger.log(
          `Test SMS sent successfully to ${this.maskPhoneNumber(phoneNumber)}`,
        );
        return {
          success: true,
          message: '测试短信发送成功！',
          messageId: smsRecord.messageId ?? undefined,
          sentAt: smsRecord.sentAt,
        };
      } else {
        this.logger.warn(`Test SMS failed: ${smsRecord.errorMessage}`);
        return {
          success: false,
          message: `发送失败：${smsRecord.errorMessage || '未知错误'}`,
          sentAt: smsRecord.sentAt,
        };
      }
    } catch (error) {
      this.logger.error(`Test SMS error: ${error.message}`, error.stack);
      return {
        success: false,
        message: `发送失败：${error.message}`,
        sentAt: new Date(),
      };
    }
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  private generateTestCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length !== 11) {
      return phoneNumber;
    }
    return `${phoneNumber.substring(0, 3)}****${phoneNumber.substring(7)}`;
  }
}
