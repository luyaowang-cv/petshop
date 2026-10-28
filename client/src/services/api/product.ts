import api from "../api";
import type {
  Product,
  ProductListParams,
  ProductListResponse,
  CreateProductDTO,
  UpdateProductDTO,
} from "@/@types/Product";

export class ProductAPI {
  static async getProducts(
    params: ProductListParams,
  ): Promise<ProductListResponse> {
    const response = await api.get<ProductListResponse>("/products", {
      params,
    });
    return response.data;
  }

  static async getProductById(id: string): Promise<Product> {
    const response = await api.get<{ product: Product }>(`/products/${id}`);
    return response.data.product;
  }

  static async createProduct(data: CreateProductDTO): Promise<Product> {
    const response = await api.post<{ product: Product }>("/products", data);
    return response.data.product;
  }

  static async updateProduct(
    id: string,
    data: UpdateProductDTO,
  ): Promise<Product> {
    const response = await api.put<{ product: Product }>(
      `/products/${id}`,
      data,
    );
    return response.data.product;
  }

  static async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  static async toggleProductStatus(id: string): Promise<Product> {
    const response = await api.patch<{ product: Product }>(
      `/products/${id}/toggle-status`,
    );
    return response.data.product;
  }

  // 批量删除商品
  static async batchDeleteProducts(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => api.delete(`/products/${id}`)));
  }

  // 批量上架商品
  static async batchActivateProducts(ids: string[]): Promise<Product[]> {
    const responses = await Promise.all(
      ids.map((id) =>
        api.patch<{ product: Product }>(`/products/${id}/toggle-status`),
      ),
    );
    return responses.map((res) => res.data.product);
  }

  // 批量下架商品
  static async batchDeactivateProducts(ids: string[]): Promise<Product[]> {
    const responses = await Promise.all(
      ids.map((id) =>
        api.patch<{ product: Product }>(`/products/${id}/toggle-status`),
      ),
    );
    return responses.map((res) => res.data.product);
  }
}

// 价格单位转换工具函数
export const yuanToCents = (yuan: number): number => {
  return Math.round(yuan * 100);
};

export const centsToYuan = (cents: number): number => {
  return cents / 100;
};
