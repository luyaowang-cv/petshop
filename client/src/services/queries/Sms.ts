import api from "../api";

export interface SmsConfig {
  id: string;
  enabled: boolean;
  provider: "ALIYUN" | "TENCENT" | "HUAWEI";
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  appointmentConfirmTemplateId?: string;
  appointmentRemindTemplateId?: string;
  appointmentCompleteTemplateId?: string;
  orderConfirmTemplateId?: string;
  balanceChangeTemplateId?: string;
  birthdayGreetingTemplateId?: string;
  appointmentConfirmEnabled: boolean;
  appointmentRemindEnabled: boolean;
  appointmentCompleteEnabled: boolean;
  orderConfirmEnabled: boolean;
  balanceChangeEnabled: boolean;
  birthdayGreetingEnabled: boolean;
  appointmentRemindHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSmsConfigRequest {
  enabled: boolean;
  provider: string;
  accessKeyId: string;
  accessKeySecret: string;
  signName: string;
  appointmentConfirmTemplateId?: string;
  appointmentRemindTemplateId?: string;
  appointmentCompleteTemplateId?: string;
  orderConfirmTemplateId?: string;
  balanceChangeTemplateId?: string;
  birthdayGreetingTemplateId?: string;
  appointmentConfirmEnabled: boolean;
  appointmentRemindEnabled: boolean;
  appointmentCompleteEnabled: boolean;
  orderConfirmEnabled: boolean;
  balanceChangeEnabled: boolean;
  birthdayGreetingEnabled: boolean;
  appointmentRemindHours: number;
}

export interface SmsRecord {
  id: string;
  phoneNumber: string;
  scenario: string;
  templateId: string;
  templateContent?: string;
  status: "SUCCESS" | "FAILED";
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
  sentAt: string;
  customerId?: string;
  appointmentId?: string;
  orderId?: string;
  petId?: string;
}

export interface ListSmsRecordsParams {
  page?: number;
  pageSize?: number;
  phoneNumber?: string;
  scenario?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListSmsRecordsResponse {
  records: SmsRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// 获取SMS配置
export async function getSmsConfig(): Promise<SmsConfig | null> {
  const response = await api.get<{ config: SmsConfig | null }>("/sms/config");
  return response.data.config;
}

// 保存SMS配置
export async function saveSmsConfig(
  config: SaveSmsConfigRequest,
): Promise<SmsConfig> {
  const response = await api.post<{ config: SmsConfig }>("/sms/config", config);
  return response.data.config;
}

// 发送测试短信
export async function sendTestSms(
  phoneNumber: string,
): Promise<{ success: boolean; message: string }> {
  const response = await api.post<{ success: boolean; message: string }>(
    "/sms/send-test",
    { phoneNumber },
  );
  return response.data;
}

// 查询SMS记录
export async function listSmsRecords(
  params: ListSmsRecordsParams,
): Promise<ListSmsRecordsResponse> {
  const response = await api.get<ListSmsRecordsResponse>("/sms/records", {
    params,
  });
  return response.data;
}
