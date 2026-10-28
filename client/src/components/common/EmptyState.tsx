"use client";

import { Empty, Button } from "antd";
import type { EmptyProps } from "antd";

interface EmptyStateProps extends EmptyProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = "暂无数据",
  description,
  actionText,
  onAction,
  image = Empty.PRESENTED_IMAGE_SIMPLE,
  ...props
}: EmptyStateProps) {
  return (
    <Empty
      image={image}
      description={
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>
            {title}
          </div>
          {description && (
            <div style={{ color: "#8c8c8c", fontSize: 14 }}>{description}</div>
          )}
        </div>
      }
      {...props}
    >
      {actionText && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Empty>
  );
}
