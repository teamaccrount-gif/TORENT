import React, { type ReactNode } from 'react';
import { Label } from "@/components/ui/Label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  children,
  htmlFor,
  className = '',
}) => {
  return (
    <div className={cn("mb-4 w-full", className)}>
      <Label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-600 mb-1"
      >
        {label}
      </Label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
