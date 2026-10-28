import { BaseEntity } from './base-entity';

export interface PointsRuleProps {
  name: string;
  description?: string | null;
  spendAmount: number;
  earnPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class PointsRule extends BaseEntity<PointsRuleProps> {
  get name(): string {
    return this.props.name;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get spendAmount(): number {
    return this.props.spendAmount;
  }

  get earnPoints(): number {
    return this.props.earnPoints;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  set name(name: string) {
    this.props.name = name;
  }

  set description(description: string | null | undefined) {
    this.props.description = description;
  }

  set spendAmount(amount: number) {
    this.props.spendAmount = amount;
  }

  set earnPoints(points: number) {
    this.props.earnPoints = points;
  }

  set isActive(isActive: boolean) {
    this.props.isActive = isActive;
  }

  static create(props: PointsRuleProps, id?: string): PointsRule {
    return new PointsRule(props, id);
  }
}
