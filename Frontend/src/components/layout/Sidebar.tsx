import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS, ALL_TECHNICAL_TABLES, TABLE_LEVELS } from '../../config/permissions';
import { canViewTableAtLevel, getEffectiveLevel } from '../../utils/registrationHelpers';
import { 
  DashboardOutlined, 
  HistoryOutlined, 
  UserAddOutlined, 
  TeamOutlined, 
  TableOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { ChevronRight } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const AppSidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const role = user.role.toLowerCase() as keyof typeof PERMISSIONS;
  const level = getEffectiveLevel(user);
  const perms = PERMISSIONS[role];

  if (!perms) {
    console.warn('[SIDEBAR] No permissions found for role:', role);
    return null;
  }

  const allowedTables = ALL_TECHNICAL_TABLES.filter((tableSlug) => {
    const tableLevel = TABLE_LEVELS[tableSlug];
    return tableLevel && canViewTableAtLevel(level, tableLevel);
  });

  const isFilterActive = location.pathname.startsWith('/filters');

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex flex-row items-center justify-between px-4">
        <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
          <span className="text-xl font-bold text-blue-600 tracking-tight italic">Torent</span>
        </div>
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarMenu>
            {perms.canAccessDashboard && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" isActive={location.pathname === '/dashboard'}>
                  <NavLink to="/dashboard">
                    <DashboardOutlined />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {perms.canAccessFilters && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="History Data" isActive={isFilterActive}>
                  <NavLink to="/filters/raw">
                    <HistoryOutlined />
                    <span>History Data</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            {perms.canAccessDashboard && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Map View" isActive={location.pathname === '/map'}>
                  <NavLink to="/map">
                    <GlobalOutlined />
                    <span>Map View</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Technical Inventory */}
        {allowedTables.length > 0 && (
          <SidebarGroup>
            <Collapsible defaultOpen className="group/collapsible">
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center cursor-pointer hover:text-foreground transition-colors">
                  Technical Inventory
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarMenu>
                  {allowedTables.map((table) => (
                    <SidebarMenuItem key={table}>
                      <SidebarMenuButton asChild tooltip={table.toUpperCase()} isActive={location.pathname === `/tables/${table}`}>
                        <NavLink to={`/tables/${table}`}>
                          <TableOutlined className="opacity-70" />
                          <span>{table.toUpperCase()}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        <SidebarSeparator />

        {/* Administration */}
        {(perms.canManage || perms.canCreate) && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarMenu>
              {perms.canManage && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Manage Users" isActive={location.pathname.startsWith('/manage')}>
                    <NavLink to="/manage">
                      <TeamOutlined />
                      <span>Manage Users</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {perms.canCreate && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Register User" isActive={location.pathname === '/register'}>
                    <NavLink to="/register">
                      <UserAddOutlined />
                      <span>Register User</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {user && (
          <div className="flex flex-col gap-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{role}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
