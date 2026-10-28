import { Injectable, Logger } from '@nestjs/common';
import { SmsConfigRepository } from '../../repositories/sms-config-repository';
import { SmsRecordRepository } from '../../repositories/sms-record-repository';
import { AesEncrypter } from '../../cryptography/aes-encrypter';
import {
  SmsProviderFactory,
  SmsProviderType,
} from '../../../infra/providers/sms-provider-factory';
import { SmsRecord, SmsStatus } from '../../entities/sms-record';
import { SmsScenario } from '../../entities/sms-config';

export interface SendSmsRequest {
  phoneNumber: string;
  scenario: SmsScenario;
  templateVariables: Record<string, string>;
  customerId?: string;
  appointmentId?: string;
  orderId?: string;
  petId?: string;
}

interface DeduplicationCacheEntry {
  timestamp: number;
  key: string;
}

@Injectable()
export class SendSmsService {
  private readonly logger = new Logger(SendSmsService.name);
  private readonly deduplicationCache = new Map<
    string,
    DeduplicationCacheEntry
  >();
  private readonly DEDUPLICATION_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly smsConfigRepository: SmsConfigRepository,
    private readonly smsRecordRepository: SmsRecordRepository,
    private readonly aesEncrypter: AesEncrypter,
    private readonly smsProviderFactory: SmsProviderFactory,
  ) {
    // Clean up cache every 10 minutes
    setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
  }

  async execute(request: SendSmsRequest): Promise<SmsRecord> {
    const {
      phoneNumber,
      scenario,
      templateVariables,
      customerId,
      appointmentId,
      orderId,
      petId,
    } = request;

    // Validate phone number format
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new Error(`Invalid phone number format: ${phoneNumber}`);
    }

    // Check deduplication
    const deduplicationKey = this.getDeduplicationKey(
      phoneNumber,
      scenario,
      appointmentId,
      orderId,
    );
    if (this.isDuplicate(deduplicationKey)) {
      this.logger.warn(
        `Duplicate SMS detected within 5 minutes: ${deduplicationKey}`,
      );
      throw new Error('Duplicate SMS request within 5 minutes');
    }

    // Get SMS configuration
    const config = await this.smsConfigRepository.findFirst();
    if (!config) {
      throw new Error('SMS configuration not found');
    }

    if (!config.enabled) {
      throw new Error('SMS service is disabled');
    }

    // Check if scenario is enabled
    if (!config.isScenarioEnabled(scenario)) {
      throw new Error(`SMS scenario ${scenario} is not enabled`);
    }

    // Get template ID for scenario
    const templateId = config.getTemplateId(scenario);
    if (!templateId) {
      // For TEST scenario, use a default template ID if not configured
      if (scenario === SmsScenario.TEST) {
        // Use a mock template ID for testing
        const mockTemplateId = 'SMS_TEST_000000';
        this.logger.warn(
          `No template ID configured for TEST scenario, using mock: ${mockTemplateId}`,
        );
      } else {
        throw new Error(`Template ID not configured for scenario: ${scenario}`);
      }
    }

    const finalTemplateId = templateId || 'SMS_TEST_000000';

    // Decrypt credentials
    const decryptedSecret = await this.aesEncrypter.decrypt(
      config.accessKeySecret,
    );

    // Create SMS provider
    const provider = this.smsProviderFactory.createProvider({
      provider: config.provider as unknown as SmsProviderType,
      accessKeyId: config.accessKeyId,
      accessKeySecret: decryptedSecret,
    });

    // Send SMS
    const result = await provider.send({
      phoneNumber,
      templateId: finalTemplateId,
      templateVariables,
      signName: config.signName,
    });

    // Create SMS record
    const smsRecord = SmsRecord.create({
      phoneNumber,
      scenario,
      templateId: finalTemplateId,
      templateContent: this.formatTemplateContent(templateVariables),
      status: result.success ? SmsStatus.SUCCESS : SmsStatus.FAILED,
      messageId: result.messageId,
      errorCode: result.errorCode,
      errorMessage: result.errorMessage,
      sentAt: new Date(),
      customerId,
      appointmentId,
      orderId,
      petId,
    });

    await this.smsRecordRepository.create(smsRecord);

    // Update deduplication cache on success
    if (result.success) {
      this.updateCache(deduplicationKey);
    }

    return smsRecord;
  }

  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Chinese mobile phone number format: 1[3-9]xxxxxxxxx
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  }

  private getDeduplicationKey(
    phoneNumber: string,
    scenario: SmsScenario,
    appointmentId?: string,
    orderId?: string,
  ): string {
    const parts = [phoneNumber, scenario];
    if (appointmentId) parts.push(appointmentId);
    if (orderId) parts.push(orderId);
    return parts.join(':');
  }

  private isDuplicate(key: string): boolean {
    const entry = this.deduplicationCache.get(key);
    if (!entry) return false;

    const now = Date.now();
    const isWithinWindow = now - entry.timestamp < this.DEDUPLICATION_WINDOW_MS;

    if (!isWithinWindow) {
      this.deduplicationCache.delete(key);
      return false;
    }

    return true;
  }

  private updateCache(key: string): void {
    this.deduplicationCache.set(key, {
      timestamp: Date.now(),
      key,
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.deduplicationCache.forEach((entry, key) => {
      if (now - entry.timestamp >= this.DEDUPLICATION_WINDOW_MS) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.deduplicationCache.delete(key));

    if (keysToDelete.length > 0) {
      this.logger.debug(
        `Cleaned up ${keysToDelete.length} expired cache entries`,
      );
    }
  }

  private formatTemplateContent(
    templateVariables: Record<string, string>,
  ): string {
    return JSON.stringify(templateVariables);
  }
}
