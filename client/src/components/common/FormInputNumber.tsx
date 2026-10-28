"use client";

import { InputNumber, Form } from "antd";
import type { InputNumberProps } from "antd";
import { Controller, useFormContext } from "react-hook-form";

interface FormInputNumberProps extends InputNumberProps {
  name: string;
  label?: string;
  required?: boolean;
  rules?: any;
}

/**
 * 集成 react-hook-form 的 InputNumber 组件
 */
export function FormInputNumber({
  name,
  label,
  required = false,
  rules,
  ...inputNumberProps
}: FormInputNumberProps) {
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
          <InputNumber
            {...field}
            {...inputNumberProps}
            style={{ width: "100%", ...inputNumberProps.style }}
          />
        </Form.Item>
      )}
    />
  );
}
