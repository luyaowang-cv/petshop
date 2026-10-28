import { Injectable } from '@nestjs/common';
import { PointsRuleRepository } from '@app/repositories/points-rule-repository';
import { PointsRule } from '@app/entities/points-rule';

interface UpdatePointsRuleRequest {
  spendAmount: number;
  earnPoints: number;
  isActive: boolean;
}

interface UpdatePointsRuleResponse {
  rule: PointsRule;
}

@Injectable()
export class UpdatePointsRuleService {
  constructor(private pointsRuleRepository: PointsRuleRepository) {}

  async execute(
    request: UpdatePointsRuleRequest,
  ): Promise<UpdatePointsRuleResponse> {
    const { spendAmount, earnPoints, isActive } = request;

    // 查找现有的活跃规则
    let rule = await this.pointsRuleRepository.findActive();

    if (rule) {
      // 更新现有规则
      rule.spendAmount = spendAmount;
      rule.earnPoints = earnPoints;
      rule.isActive = isActive;
      await this.pointsRuleRepository.update(rule);
    } else {
      // 创建新规则
      rule = PointsRule.create({
        name: '消费积分规则',
        description: `每消费${spendAmount / 100}元获得${earnPoints}积分`,
        spendAmount,
        earnPoints,
        isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.pointsRuleRepository.create(rule);
    }

    return { rule };
  }
}
