import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../config/permissions';
import { 
  DashboardOutlined, 
  HistoryOutlined, 
  UserAddOutlined, 
  TeamOutlined, 
  TableOutlined 
} from '@ant-design/icons';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();

  if (!role) return null;

  const perms = PERMISSIONS[role];
  if (!perms) {
    console.warn('[SIDEBAR] No permissions found for role:', role);
    return null;
  }
  const isFilterActive = location.pathname.startsWith('/filters');

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col shrink-0 overflow-y-auto">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
        <span className="text-xl font-bold text-blue-600 tracking-tight italic">Torent</span>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-8">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</p>
          {perms.canAccessDashboard && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <DashboardOutlined className="mr-3" /> Dashboard
            </NavLink>
          )}
          {perms.canAccessFilters && (
            <NavLink
              to="/filters/raw"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isFilterActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HistoryOutlined className="mr-3" /> History Data
            </NavLink>
          )}
        </nav>

        {/* Technical Inventory (Tables) */}
        {perms.allowedTables.length > 0 && (
          <nav className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Technical Inventory</p>
            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {perms.allowedTables.map((table) => (
                <NavLink
                  key={table}
                  to={`/tables/${table}`}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <TableOutlined className="mr-3 opacity-70" /> {table.toUpperCase()}
                </NavLink>
              ))}
            </div>
          </nav>
        )}

        {/* Administration */}
        {(perms.canManage.length > 0 || perms.canCreate.length > 0) && (
          <nav className="space-y-1">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Administration</p>
            {perms.canManage.length > 0 && (
              <NavLink
                to="/manage"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <TeamOutlined className="mr-3" /> Manage Users
              </NavLink>
            )}
            {perms.canCreate.length > 0 && (
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <UserAddOutlined className="mr-3" /> Register User
              </NavLink>
            )}
          </nav>
        )}
      </div>
    </aside>
  );
};
