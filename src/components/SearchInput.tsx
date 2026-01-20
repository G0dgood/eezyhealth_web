import { Search } from "lucide-react";
import Input from "./Input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative max-w-md bg-white ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        icon={<Search className="w-5 h-5 text-gray-400" />}
        fullWidth
        className="cursor-pointer"
      />
    </div>
  );
}
