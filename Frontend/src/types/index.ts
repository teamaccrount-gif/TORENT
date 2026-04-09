export type Role = 'ADMIN' | 'SUPER_ADMIN' | 'REGION_MANAGER' | 'CITY_MANAGER' | 'STATION_MANAGER';

export interface User {
  id: string | number;
  email: string;
  phone: string;
  role: Role | { name: string };
  first_name?: string;
  last_name?: string;
  isActive?: boolean;
  is_active?: boolean;
  assignedCities?: City[];
  assignedStation?: Station;
}

export interface ManageableUser extends User {
  created_at: string;
  createdAt?: string;
  updatedAt?: string;
  access: RegistrationAccessPayload | null;
}

export interface City {
  city_id: string;
  city_name: string;
}

export interface Station {
  station_id: string;
  station_name: string;
}

export interface RoleOption {
  role_id: string;
  role_name: string;
}

export interface RegionOption {
  region_id: string;
  region_name: string;
}

export interface AreaOption {
  area_id: string;
  area_name: string;
  region_name: string;
}

export interface RegistrationStationOption {
  station_id: string;
  station_name: string;
  area_name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export type RegistrationAccessLevel = 'region_level' | 'city_level' | 'station_level';

export interface RegistrationAccessPayload {
  level: RegistrationAccessLevel;
  regions: string[];
  areas: string[];
  stations: string[];
}

export interface RegistrationPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  role_id: number;
  level: RegistrationAccessLevel;
  regions: string[];
  areas: string[];
  stations: string[];
}
