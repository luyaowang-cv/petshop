import { Injectable } from '@nestjs/common';
import { PointsRuleRepository } from 'src/app/repositories/points-rule-repository';
import { PointsRule } from 'src/app/entities/points-rule';
import { PrismaService } from '../prisma.service';
import { PointsRuleMapper } from '../mappers/points-rule-mapper';

@Injectable()
export class PrismaPointsRuleRepository implements PointsRuleRepository {
  constructor(private prisma: PrismaService) {}

  async create(rule: PointsRule): Promise<void> {
    const data = PointsRuleMapper.toPrisma(rule);
    await this.prisma.pointsRule.create({ data });
  }

  async findById(id: string): Promise<PointsRule | null> {
    const rule = await this.prisma.pointsRule.findUnique({
      where: { id },
    });

    if (!rule) return null;

    return PointsRuleMapper.toDomain(rule);
  }

  async findActive(): Promise<PointsRule | null> {
    const rule = await this.prisma.pointsRule.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!rule) return null;

    return PointsRuleMapper.toDomain(rule);
  }

  async update(rule: PointsRule): Promise<void> {
    const data = PointsRuleMapper.toPrisma(rule);
    await this.prisma.pointsRule.update({
      where: { id: rule.id },
      data,
    });
  }

  async list(): Promise<PointsRule[]> {
    const rules = await this.prisma.pointsRule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return rules.map(PointsRuleMapper.toDomain);
  }
}
