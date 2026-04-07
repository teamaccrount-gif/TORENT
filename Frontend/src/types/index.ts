export type Role = 'SUPER_ADMIN' | 'REGION_MANAGER' | 'CITY_MANAGER' | 'STATION_MANAGER';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: Role;
  name?: string;
  isActive: boolean;
  assignedCities?: City[];
  assignedStation?: Station;
}

export interface ManageableUser extends User {
  createdAt: string;
  updatedAt: string;
}

export interface City {
  city_id: string;
  city_name: string;
}

export interface Station {
  station_id: string;
  station_name: string;
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

export interface RegistrationPayload {
  email: string;
  password?: string;
  phone: string;
  role: Role;
  assigned_city_ids?: string[];
  assigned_station_id?: string;
}
