export enum ServiceStatus {
  ACTIVE = "ACTIVE", // 启用
  INACTIVE = "INACTIVE", // 停用
}

/** 服务分类（工作台可自由新增，如「美容」） */
export type ServiceCategory = {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ServiceCategoryInput = {
  name: string;
  icon?: string | null;
  sortOrder?: number;
};

export type PetshopService = {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  category: ServiceCategory | null;
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
  categoryId: string;
  value: number;
  duration?: number; // 可选，保留以便后续扩展
  status?: ServiceStatus;
  imageUrl?: string | null;
};
