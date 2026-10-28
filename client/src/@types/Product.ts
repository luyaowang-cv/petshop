export enum ProductCategory {
  FOOD = "FOOD",
  SUPPLIES = "SUPPLIES",
  MEDICINE = "MEDICINE",
  TOY = "TOY",
  PET = "PET",
  OTHER = "OTHER",
}

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // 分
  cost: number; // 分
  stock: number;
  minStock: number;
  unit: string;
  status: ProductStatus;
  description?: string | null;
  imageUrl?: string | null;
  supplierId?: string | null;
  createdAt: string;
  updatedAt: string;
  isLowStock: boolean;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: ProductCategory;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProductListResponse {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateProductDTO {
  name: string;
  category: ProductCategory;
  price: number; // 分
  cost: number; // 分
  stock: number;
  minStock: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  supplierId?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}
