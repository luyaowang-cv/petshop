// 洗护记录
export type GroomingRecord = {
  id: string;
  petId: string;
  serviceType: string; // 服务类型
  serviceDate: string; // 服务日期
  groomer?: string | null; // 美容师
  notes?: string | null; // 备注
  cost: number; // 费用（分）
  createdAt: string;
  updatedAt: string;
};

// 医疗记录
export type MedicalRecord = {
  id: string;
  petId: string;
  recordType: string; // 记录类型
  recordDate: string; // 记录日期
  veterinarian?: string | null; // 兽医
  diagnosis?: string | null; // 诊断
  treatment?: string | null; // 治疗方案
  medication?: string | null; // 用药
  notes?: string | null; // 备注
  cost: number; // 费用（分）
  createdAt: string;
  updatedAt: string;
};
