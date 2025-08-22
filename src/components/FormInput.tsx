"use client";

interface FormInputProps {
  label: string;
  type?: "text" | "email" | "password" | "tel" | "date";
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
      />
    </div>
  );
}
