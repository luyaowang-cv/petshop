import { Pet } from "./Pet";

export enum MemberLevel {
  REGULAR = "REGULAR", // 普通用户
  VIP = "VIP", // VIP会员
}

export type Customer = {
  id: string;
  name: string;
  phone: string;
  pets: Pet[];
  notes?: string | null; // 备注
  lastVisitAt?: string | null; // 最近到店时间
  totalSpent: number; // 累计消费（分）
  // 会员相关字段
  memberLevel: MemberLevel;
  memberPoints: number;
  memberBalance: number; // 储值余额（分）
  memberJoinedAt?: string | null; // 成为会员时间
  createdAt: string;
  updatedAt: string;
};
