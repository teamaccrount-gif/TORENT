import React from 'react';
import { Spinner } from './Spinner';

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

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ className = '', options, error, isLoading, disabled, placeholder = 'Select an option', ...props }, ref) => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-1 disabled:bg-gray-50 disabled:text-gray-500 transition-colors bg-white';
    const errorClasses = error
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-200 text-gray-900 focus:ring-blue-500 focus:border-blue-500';

    return (
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled || isLoading}
          className={`${baseClasses} ${errorClasses} ${className} ${isLoading ? 'pr-10' : ''}`}
          {...props}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-blue-600">
            <Spinner size="sm" />
          </div>
        )}
      </div>
    );
  }
);
Dropdown.displayName = 'Dropdown';
