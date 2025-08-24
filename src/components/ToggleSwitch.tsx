"use client";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  className = "",
}: ToggleSwitchProps) {
  const sizeClasses = {
    sm: "w-9 h-5",
    md: "w-11 h-6",
    lg: "w-14 h-7",
  };

  const circleSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const translateClasses = {
    sm: checked ? "translate-x-4" : "translate-x-0",
    md: checked ? "translate-x-5" : "translate-x-0",
    lg: checked ? "translate-x-7" : "translate-x-0",
  };

  return (
    <label
      className={`relative inline-flex items-center cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`${
          sizeClasses[size]
        } rounded-full transition-colors flex items-center ${
          checked ? "bg-[#44CE2D]" : "bg-gray-300"
        } ${disabled ? "cursor-not-allowed" : ""}`}>
        <div
          className={`${circleSizeClasses[size]} bg-white rounded-full transition-transform transform shadow-sm ${translateClasses[size]}`}></div>
      </div>
    </label>
  );
}
