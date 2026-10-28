import api from "../api";

// 充值记录
export interface RechargeRecord {
  id: string;
  customerId: string;
  amount: number;
  balance: number;
  operator: string;
  note?: string | null;
  createdAt: string;
}

// 积分记录
export interface PointsRecord {
  id: string;
  customerId: string;
  action: "ADD" | "DEDUCT" | "CONSUME" | "EXPIRE";
  points: number;
  balance: number;
  reason: string;
  operator?: string | null;
  createdAt: string;
}

// 积分规则
export interface PointsRule {
  id: string;
  name: string;
  description?: string | null;
  spendAmount: number;
  earnPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 获取充值记录
export const fetchRechargeRecords = async (
  customerId: string,
): Promise<RechargeRecord[]> => {
  const response = await api.get(`/members/${customerId}/recharge-records`);
  return response.data.records;
};

// 创建充值记录
export const createRechargeRecord = async (
  customerId: string,
  data: { amount: number; note?: string },
): Promise<RechargeRecord> => {
  const response = await api.post(
    `/members/${customerId}/recharge-records`,
    data,
  );
  return response.data.record;
};

// 获取积分记录
export const fetchPointsRecords = async (
  customerId: string,
): Promise<PointsRecord[]> => {
  const response = await api.get(`/members/${customerId}/points-records`);
  return response.data.records;
};

// 创建积分记录
export const createPointsRecord = async (
  customerId: string,
  data: {
    points: number;
    action: "ADD" | "DEDUCT" | "CONSUME" | "EXPIRE";
    reason?: string;
  },
): Promise<PointsRecord> => {
  const response = await api.post(
    `/members/${customerId}/points-records`,
    data,
  );
  return response.data.record;
};

// 获取积分规则
export const fetchPointsRule = async (): Promise<PointsRule | null> => {
  const response = await api.get("/members/points-rule");
  return response.data.rule;
};

// 更新积分规则
export const updatePointsRule = async (data: {
  spendAmount: number;
  earnPoints: number;
  isActive: boolean;
}): Promise<PointsRule> => {
  const response = await api.put("/members/points-rule", data);
  return response.data.rule;
};
