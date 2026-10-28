import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import type {
  StockRecord,
  StockRecordListParams,
  StockRecordListResponse,
  CreateStockRecordDTO,
} from "@/@types/StockRecord";
import { message } from "antd";

// API functions
export class StockRecordAPI {
  static async getStockRecords(
    params: StockRecordListParams,
  ): Promise<StockRecordListResponse> {
    const response = await api.get<StockRecordListResponse>("/stock-records", {
      params,
    });
    return response.data;
  }

  static async createStockRecord(
    data: CreateStockRecordDTO,
  ): Promise<StockRecord> {
    const response = await api.post<{ stockRecord: StockRecord }>(
      "/stock-records",
      data,
    );
    return response.data.stockRecord;
  }
}

// Query hooks
export function useStockRecords(params: StockRecordListParams) {
  return useQuery({
    queryKey: ["stock-records", params],
    queryFn: () => StockRecordAPI.getStockRecords(params),
  });
}

// Mutation hooks
export function useStockRecordMutations() {
  const queryClient = useQueryClient();

  const createStockRecord = useMutation({
    mutationFn: (data: CreateStockRecordDTO) =>
      StockRecordAPI.createStockRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-records"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("入库成功");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "入库失败");
    },
  });

  return {
    createStockRecord,
  };
}
