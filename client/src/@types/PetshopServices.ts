export enum ServiceCategory {
  GROOMING = "GROOMING", // 洗护
  MEDICAL = "MEDICAL", // 医疗
  BOARDING = "BOARDING", // 寄养
}

export enum ServiceStatus {
  ACTIVE = "ACTIVE", // 启用
  INACTIVE = "INACTIVE", // 停用
}

export type PetshopService = {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  value: number;
  duration?: number; // 可选，保留以便后续扩展
  imageUrl?: string | null; // 封面图
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
};

export type PetshopServiceBodyData = {
  title: string;
  description: string;
  category: ServiceCategory;
  value: number;
  duration?: number; // 可选，保留以便后续扩展
  status?: ServiceStatus;
};
