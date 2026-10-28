"use client";

import { Tag } from "antd";
import type { TagProps } from "antd";
import { AppointmentStatus } from "@/@types/Appointment";

export type { AppointmentStatus } from "@/@types/Appointment";

// 状态配置：与预约管理页 getStatusConfig 保持一致
const statusConfig: Record<
  AppointmentStatus,
  { color: TagProps["color"]; text: string }
> = {
  [AppointmentStatus.PENDING]: {
    color: "processing",
    text: "待审核",
  },
  [AppointmentStatus.CONFIRMED]: {
    color: "success",
    text: "已确认",
  },
  [AppointmentStatus.REJECTED]: {
    color: "error",
    text: "已拒绝",
  },
  [AppointmentStatus.DONE]: {
    color: "warning",
    text: "待支付",
  },
  [AppointmentStatus.PENDING_PAYMENT]: {
    color: "warning",
    text: "待支付",
  },
  [AppointmentStatus.COMPLETED]: {
    color: "success",
    text: "已完成",
  },
  [AppointmentStatus.CANCELED]: {
    color: "default",
    text: "已取消",
  },
};

interface StatusTagProps {
  status: AppointmentStatus;
  style?: React.CSSProperties;
}

export function StatusTag({ status, style }: StatusTagProps) {
  const config =
    statusConfig[status] || statusConfig[AppointmentStatus.PENDING];

  return (
    <Tag color={config.color} style={style}>
      {config.text}
    </Tag>
  );
}

// 导出状态配置供其他组件使用
export { statusConfig };
