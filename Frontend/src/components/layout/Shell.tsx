import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export const Shell: React.FC = () => {
  const location = useLocation();
  const isMapPage = location.pathname.startsWith('/map');

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col bg-gray-50 h-full min-h-0 overflow-hidden">
        <Navbar />
        <main className={isMapPage ? 'relative flex-1 overflow-hidden h-full min-h-screen' : 'flex-1 overflow-y-auto p-4 md:p-6'}>
          {isMapPage ? (
            <Outlet />
          ) : (
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
