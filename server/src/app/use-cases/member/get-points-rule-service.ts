import { Injectable } from '@nestjs/common';
import { PointsRuleRepository } from '@app/repositories/points-rule-repository';
import { PointsRule } from '@app/entities/points-rule';

interface GetPointsRuleResponse {
  rule: PointsRule | null;
}

@Injectable()
export class GetPointsRuleService {
  constructor(private pointsRuleRepository: PointsRuleRepository) {}

  async execute(): Promise<GetPointsRuleResponse> {
    const rule = await this.pointsRuleRepository.findActive();

    return { rule };
  }
}
