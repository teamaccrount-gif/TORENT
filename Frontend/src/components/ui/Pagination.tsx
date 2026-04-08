import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 mt-4 rounded-b-lg">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button variant="secondary" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>Previous</Button>
        <Button variant="secondary" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading} className="ml-3">Next</Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages || 1}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <Button variant="secondary" className="rounded-r-none border-r-0" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1 || isLoading}>Previous</Button>
            <Button variant="secondary" className="rounded-l-none" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages || isLoading}>Next</Button>
          </nav>
        </div>
      </div>
    </div>
  );
};
