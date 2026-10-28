"use client";

import { DatePicker, Form } from "antd";
import type { DatePickerProps } from "antd";
import { Controller, useFormContext } from "react-hook-form";
import dayjs from "dayjs";

interface FormDatePickerProps extends Omit<
  DatePickerProps,
  "value" | "onChange"
> {
  name: string;
  label?: string;
  required?: boolean;
  rules?: any;
}

/**
 * 集成 react-hook-form 的 DatePicker 组件
 */
export function FormDatePicker({
  name,
  label,
  required = false,
  rules,
  ...datePickerProps
}: FormDatePickerProps) {
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
          <DatePicker
            {...field}
            {...datePickerProps}
            value={field.value ? dayjs(field.value) : null}
            onChange={(date) => {
              field.onChange(date ? date.toISOString() : null);
            }}
            style={{ width: "100%" }}
          />
        </Form.Item>
      )}
    />
  );
}

/**
 * 时间选择器
 */
export function FormTimePicker({
  name,
  label,
  required = false,
  rules,
  ...timePickerProps
}: FormDatePickerProps) {
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
          <DatePicker
            {...field}
            {...timePickerProps}
            showTime
            value={field.value ? dayjs(field.value) : null}
            onChange={(date) => {
              field.onChange(date ? date.toISOString() : null);
            }}
            style={{ width: "100%" }}
          />
        </Form.Item>
      )}
    />
  );
}
