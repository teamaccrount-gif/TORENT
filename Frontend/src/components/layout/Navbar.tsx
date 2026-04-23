import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { RoleBadge } from '../ui/Badge';
import { useAppDispatch } from '../../Redux/Store';
import { logoutUser } from '../../Redux/Slices/authSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await dispatch(logoutUser({ method: 'POST', payload: { refresh_token: refreshToken } }));
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refresh_token');
      logout();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div className="flex md:hidden">
          <span className="text-xl font-bold text-blue-600 italic">Torent</span>
        </div>
      </div>
      
      <div className="flex-1" />

      {user && role && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer h-8 w-8 border border-gray-200 shadow-sm hover:ring-2 hover:ring-blue-100 transition-all">
              <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                {user.email.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                <RoleBadge role={role} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};
