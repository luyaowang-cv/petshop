"use client";

import { Form } from "antd";
import type { FormItemProps as AntFormItemProps } from "antd";
import { useFormContext, Controller } from "react-hook-form";

interface FormItemProps extends Omit<AntFormItemProps, "children"> {
  name: string;
  children: React.ReactElement;
}

/**
 * 集成 react-hook-form 和 Ant Design Form.Item 的包装器
 * 使用 Controller 来连接两者
 */
export function FormItem({ name, children, ...formItemProps }: FormItemProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item
          {...formItemProps}
          validateStatus={error ? "error" : ""}
          help={error?.message as string}
        >
          {children}
        </Form.Item>
      )}
    />
  );
}
