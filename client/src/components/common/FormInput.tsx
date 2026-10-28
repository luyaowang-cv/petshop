"use client";

import { Input, Form } from "antd";
import type { InputProps } from "antd";
import { Controller, useFormContext } from "react-hook-form";

interface FormInputProps extends InputProps {
  name: string;
  label?: string;
  required?: boolean;
  rules?: any;
}

/**
 * 集成 react-hook-form 的 Input 组件
 */
export function FormInput({
  name,
  label,
  required = false,
  rules,
  ...inputProps
}: FormInputProps) {
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
          <Input {...field} {...inputProps} />
        </Form.Item>
      )}
    />
  );
}

/**
 * 密码输入框
 */
export function FormPasswordInput({
  name,
  label,
  required = false,
  rules,
  ...inputProps
}: FormInputProps) {
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
          <Input.Password {...field} {...inputProps} />
        </Form.Item>
      )}
    />
  );
}

/**
 * 文本域
 */
interface FormTextAreaProps extends React.ComponentProps<
  typeof Input.TextArea
> {
  name: string;
  label?: string;
  required?: boolean;
  rules?: any;
}

export function FormTextArea({
  name,
  label,
  required = false,
  rules,
  ...textAreaProps
}: FormTextAreaProps) {
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
          <Input.TextArea {...field} {...textAreaProps} />
        </Form.Item>
      )}
    />
  );
}
