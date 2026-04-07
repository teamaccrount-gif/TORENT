import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RoleBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex md:hidden">
        <span className="text-xl font-bold text-blue-600">Torent</span>
      </div>
      <div className="flex-1 md:flex-none"></div>
      
      {user && role && (
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">{user.email}</span>
            <RoleBadge role={role} />
          </div>
          <Button variant="secondary" onClick={logout} className="text-xs py-1.5 px-3">
            Logout
          </Button>
        </div>
      )}
    </header>
  );
};
