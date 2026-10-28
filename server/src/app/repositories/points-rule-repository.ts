import { PointsRule } from '../entities/points-rule';

export abstract class PointsRuleRepository {
  abstract create(rule: PointsRule): Promise<void>;
  abstract findById(id: string): Promise<PointsRule | null>;
  abstract findActive(): Promise<PointsRule | null>;
  abstract update(rule: PointsRule): Promise<void>;
  abstract list(): Promise<PointsRule[]>;
}
