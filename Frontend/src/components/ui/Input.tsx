import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, disabled, ...props }, ref) => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-1 disabled:bg-gray-50 disabled:text-gray-500 transition-colors';
    const errorClasses = error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500';

    return (
      <input
        ref={ref}
        disabled={disabled}
        className={`${baseClasses} ${errorClasses} ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
