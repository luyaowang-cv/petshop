import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductAPI } from "../api/product";
import type {
  ProductListParams,
  CreateProductDTO,
  UpdateProductDTO,
} from "@/@types/Product";
import { message } from "antd";

// 查询商品列表
export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => ProductAPI.getProducts(params),
  });
}

// 查询单个商品
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => ProductAPI.getProductById(id),
    enabled: !!id,
  });
}

// 商品变更操作
export function useProductMutations() {
  const queryClient = useQueryClient();

  const createProduct = useMutation({
    mutationFn: (data: CreateProductDTO) => ProductAPI.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("商品创建成功");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "商品创建失败");
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDTO }) =>
      ProductAPI.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      message.success("商品更新成功");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "商品更新失败");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => ProductAPI.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("商品删除成功");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "商品删除失败");
    },
  });

  const toggleProductStatus = useMutation({
    mutationFn: (id: string) => ProductAPI.toggleProductStatus(id),
    onMutate: async (id: string) => {
      // 取消所有正在进行的查询
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // 获取所有匹配的查询数据
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["products"],
      });

      // 乐观更新：立即更新所有匹配的查询
      previousQueries.forEach(([queryKey, oldData]) => {
        if (oldData && typeof oldData === "object" && "data" in oldData) {
          const typedOldData = oldData as any;
          queryClient.setQueryData(queryKey, {
            ...typedOldData,
            data: typedOldData.data.map((product: any) => {
              if (product.id === id) {
                return {
                  ...product,
                  status: product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                };
              }
              return product;
            }),
          });
        }
      });

      // 返回上下文，用于回滚
      return { previousQueries };
    },
    onSuccess: () => {
      // 成功后重新获取数据以确保同步
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("商品状态更新成功");
    },
    onError: (error: any, id, context) => {
      // 出错时回滚到之前的状态
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      message.error(error.response?.data?.message || "商品状态更新失败");
    },
  });

  // 批量删除商品
  const batchDeleteProducts = useMutation({
    mutationFn: (ids: string[]) => ProductAPI.batchDeleteProducts(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success(`成功删除 ${ids.length} 个商品`);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "批量删除失败");
    },
  });

  // 批量上架商品
  const batchActivateProducts = useMutation({
    mutationFn: (ids: string[]) => ProductAPI.batchActivateProducts(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success(`成功上架 ${ids.length} 个商品`);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "批量上架失败");
    },
  });

  // 批量下架商品
  const batchDeactivateProducts = useMutation({
    mutationFn: (ids: string[]) => ProductAPI.batchDeactivateProducts(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success(`成功下架 ${ids.length} 个商品`);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "批量下架失败");
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    batchDeleteProducts,
    batchActivateProducts,
    batchDeactivateProducts,
  };
}
