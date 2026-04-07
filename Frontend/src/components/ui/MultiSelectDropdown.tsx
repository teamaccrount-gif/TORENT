import React, { useState, useRef, useEffect } from 'react';
import { Spinner } from './Spinner';

interface Option {
  value: string;
  label: string;
}

export interface MultiSelectDropdownProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  value,
  onChange,
  error,
  isLoading,
  disabled,
  placeholder = 'Select options',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (val: string) => {
    if (disabled) return;
    const isSelected = value.includes(val);
    if (isSelected) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const baseContainerClasses = 'relative w-full';
  const triggerBaseClasses = 'flex items-center justify-between w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm bg-white cursor-pointer disabled:bg-gray-50';
  const errorClasses = error
    ? 'border-red-300 text-red-900 focus:ring-red-500'
    : 'border-gray-200 text-gray-900 focus:ring-blue-500';

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label)
    .join(', ');

  return (
    <div className={`${baseContainerClasses} ${className}`} ref={containerRef}>
      <div
        className={`${triggerBaseClasses} ${errorClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
      >
        <span className="truncate flex-1">
          {value.length > 0 ? selectedLabels : <span className="text-gray-400">{placeholder}</span>}
        </span>
        {isLoading ? (
          <Spinner size="sm" className="text-blue-600" />
        ) : (
          <svg className="h-4 w-4 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
          ) : (
            options.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-blue-50"
                  onClick={() => toggleOption(opt.value)}
                >
                  <div className={`h-4 w-4 flex-shrink-0 border rounded mr-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                    {isSelected && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 truncate">{opt.label}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
