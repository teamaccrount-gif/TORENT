import type { Role } from '../types';

export interface RolePermissions {
  canCreate: Role[];
  canManage: Role[];
  canAccessFilters: boolean;
  canAccessDashboard: boolean;
  allowedTables: string[];
}

export const PERMISSIONS: Record<Role, RolePermissions> = {
  ADMIN: {
    canCreate: ['REGION_MANAGER'],
    canManage: ['REGION_MANAGER', 'CITY_MANAGER', 'STATION_MANAGER'],
    canAccessFilters: true,
    canAccessDashboard: true,
    allowedTables: ['region', 'area', 'station', 'cgs', 'device', 'png', 'lcng', 'industrial', 'commercial', 'dispenser', 'compressor', 'drs', 'domestic'],
  },  
  // MANAGER: {
  //   canCreate: ['REGION_MANAGER'],
  //   canManage: ['REGION_MANAGER', 'CITY_MANAGER', 'STATION_MANAGER'],
  //   canAccessFilters: true,
  //   canAccessDashboard: true,
  //   allowedTables: ['region', 'area', 'station', 'cgs', 'device', 'png', 'lcng', 'industrial', 'commercial', 'dispenser', 'compressor', 'drs', 'domestic'],
  // },
  SUPER_ADMIN: {
    canCreate: ['REGION_MANAGER'],
    canManage: ['REGION_MANAGER', 'CITY_MANAGER', 'STATION_MANAGER'],
    canAccessFilters: true,
    canAccessDashboard: true,
    allowedTables: ['region', 'area', 'station', 'cgs', 'device', 'png', 'lcng', 'industrial', 'commercial', 'dispenser', 'compressor', 'drs', 'domestic'],
  },
  REGION_MANAGER: {
    canCreate: ['CITY_MANAGER'],
    canManage: ['CITY_MANAGER', 'STATION_MANAGER'],
    canAccessFilters: true,
    canAccessDashboard: true,
    allowedTables: ['area', 'station', 'cgs', 'device', 'png', 'lcng', 'industrial', 'commercial', 'dispenser', 'compressor', 'drs', 'domestic'],
  },
  CITY_MANAGER: {
    canCreate: ['STATION_MANAGER'],
    canManage: ['STATION_MANAGER'],
    canAccessFilters: true,
    canAccessDashboard: true,
    allowedTables: ['station', 'cgs', 'device', 'png', 'lcng', 'industrial', 'commercial', 'dispenser', 'compressor', 'drs', 'domestic'],
  },
  STATION_MANAGER: {
    canCreate: [],
    canManage: [],
    canAccessFilters: true,
    canAccessDashboard: true,
    allowedTables: ['dispenser', 'compressor', 'device'],
  },
};
