"use client";

import { useState } from "react";
import Input from "./Input";

interface FormInputProps {
  label: string;
  type?: "text" | "email" | "password" | "tel" | "date" | "time";
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function FormInput({
  label,
  type = "text",
  placeholder,
  value = "",
  onChange,
  required = false,
  className = "",
}: FormInputProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <Input
        label={label}
        type={type as any}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        required={required}
        showPasswordToggle={type === "password"}
        fullWidth
      />
    </div>
  );
}
