"use client";

import { Select, Form } from "antd";
import type { SelectProps } from "antd";
import { Controller, useFormContext } from "react-hook-form";

interface FormSelectProps extends SelectProps {
  name: string;
  label?: string;
  required?: boolean;
  rules?: any;
}

/**
 * 集成 react-hook-form 的 Select 组件
 */
export function FormSelect({
  name,
  label,
  required = false,
  rules,
  ...selectProps
}: FormSelectProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <Form.Item
          label={label}
          required={required}
          validateStatus={error ? "error" : ""}
          help={error?.message as string}
        >
          <Select {...field} {...selectProps} />
        </Form.Item>
      )}
    />
  );
}
