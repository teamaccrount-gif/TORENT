import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  error?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export const Dropdown = React.forwardRef<HTMLButtonElement, DropdownProps>(
  ({ className = '', options, error, isLoading, disabled, placeholder = 'Select an option', value, onChange, ...props }, ref) => {
    const handleValueChange = (val: string) => {
      if (onChange) {
        onChange({ target: { value: val } } as React.ChangeEvent<HTMLSelectElement>);
      }
    };

    return (
      <Select
        value={value as string}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          ref={ref}
          className={cn(
            "w-full",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

Dropdown.displayName = 'Dropdown';
