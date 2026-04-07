import React, { type ReactNode } from 'react';

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
    <div className={`mb-4 w-full ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-600 mb-1"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
