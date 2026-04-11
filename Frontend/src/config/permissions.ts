import type { RegistrationAccessLevel, Role } from '../types';

export interface RolePermissions {
  canCreate: boolean;
  canManage: boolean;
  canAccessFilters: boolean;
  canAccessDashboard: boolean;
  // allowedTables is now handled by level-based logic in ProtectedRoute and Sidebar
}

export const PERMISSIONS: Record<Role, RolePermissions> = {
  'super_admin': {
    canCreate: true,
    canManage: true,
    canAccessFilters: true,
    canAccessDashboard: true,
  },
  'admin': {
    canCreate: true,
    canManage: true,
    canAccessFilters: true,
    canAccessDashboard: true,
  },
  'manager': {
    canCreate: false,
    canManage: false,
    canAccessFilters: true,
    canAccessDashboard: true,
  },
  'engineer': {
    canCreate: false,
    canManage: false,
    canAccessFilters: true,
    canAccessDashboard: true,
  },
  'operator': {
    canCreate: false,
    canManage: false,
    canAccessFilters: true,
    canAccessDashboard: true,
  },
};

// Mapping of table slugs to their hierarchical level
export const TABLE_LEVELS: Record<string, RegistrationAccessLevel> = {
  country: 'country',
  region: 'region',
  area: 'city',
  station: 'station',
  cgs: 'station', // Technical tables are treated as station level or below
  device: 'station',
  png: 'station',
  lcng: 'station',
  industrial: 'station',
  commercial: 'station',
  dispenser: 'station',
  compressor: 'station',
  drs: 'station',
  domestic: 'station',
};

export const ALL_TECHNICAL_TABLES = [
  'country', 'region', 'area', 'station', 'cgs', 'device', 'png', 
  'lcng', 'industrial', 'commercial', 'dispenser', 'compressor', 'drs', 'domestic'
];
