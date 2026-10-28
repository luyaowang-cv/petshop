import { PointsRule } from '@app/entities/points-rule';

export class PointsRuleViewModel {
  static toHTTP(rule: PointsRule) {
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
