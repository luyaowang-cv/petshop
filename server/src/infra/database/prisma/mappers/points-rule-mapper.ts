import { PointsRule as PrismaPointsRule } from '@prisma/client';
import { PointsRule } from 'src/app/entities/points-rule';

export class PointsRuleMapper {
  static toDomain(raw: PrismaPointsRule): PointsRule {
    return PointsRule.create(
      {
        name: raw.name,
        description: raw.description,
        spendAmount: raw.spendAmount,
        earnPoints: raw.earnPoints,
        isActive: raw.isActive,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  static toPrisma(rule: PointsRule) {
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      spendAmount: rule.spendAmount,
      earnPoints: rule.earnPoints,
      isActive: rule.isActive,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
