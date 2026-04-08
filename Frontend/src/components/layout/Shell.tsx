import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Shell: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
