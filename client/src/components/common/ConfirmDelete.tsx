"use client";

import { Popconfirm, Button } from "antd";
import { DeleteOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import type { PopconfirmProps } from "antd";

interface ConfirmDeleteProps extends Omit<PopconfirmProps, "title"> {
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
  buttonText?: string;
  buttonType?: "text" | "link" | "default" | "primary" | "dashed";
  danger?: boolean;
}

export function ConfirmDelete({
  title = "确认删除",
  description = "删除后无法恢复，确定要删除吗？",
  onConfirm,
  loading = false,
  buttonText,
  buttonType = "text",
  danger = true,
  ...props
}: ConfirmDeleteProps) {
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      okText="确认"
      cancelText="取消"
      okButtonProps={{ danger: true, loading }}
      icon={<QuestionCircleOutlined style={{ color: "red" }} />}
      {...props}
    >
      <Button
        type={buttonType}
        danger={danger}
        icon={<DeleteOutlined />}
        loading={loading}
      >
        {buttonText}
      </Button>
    </Popconfirm>
  );
}
