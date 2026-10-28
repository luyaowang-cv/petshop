import { Injectable } from '@nestjs/common';
import { SmsConfigRepository } from '@app/repositories/sms-config-repository';
import { SmsConfig } from '@app/entities/sms-config';
import { PrismaService } from '../prisma.service';
import { SmsConfigMapper } from '../mappers/sms-config-mapper';

@Injectable()
export class PrismaSmsConfigRepository implements SmsConfigRepository {
  constructor(private prisma: PrismaService) {}

  async upsert(config: SmsConfig): Promise<SmsConfig> {
    const data = SmsConfigMapper.toPrisma(config);

    // Check if any config exists
    const existing = await this.prisma.smsConfig.findFirst();

    let raw;
    if (existing) {
      // Update existing config
      raw = await this.prisma.smsConfig.update({
        where: { id: existing.id },
        data,
      });
    } else {
      // Create new config
      raw = await this.prisma.smsConfig.create({
        data,
      });
    }

    return SmsConfigMapper.toDomain(raw);
  }

  async findFirst(): Promise<SmsConfig | null> {
    const raw = await this.prisma.smsConfig.findFirst();

    if (!raw) return null;

    return SmsConfigMapper.toDomain(raw);
  }

  async update(id: string, config: Partial<SmsConfig>): Promise<SmsConfig> {
    const raw = await this.prisma.smsConfig.update({
      where: { id },
      data: config as any,
    });

    return SmsConfigMapper.toDomain(raw);
  }
}
