import type { User, City, Station, ManageableUser, ApiResponse, Role, RegistrationAccessLevel } from '../types';

export const mockResponse = <T>(data: T, delay = 800): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data,
        message: "Mock request successful"
      });
    }, delay);
  });
};

export const getMockUserByEmail = (email: string): User => {
  let role: Role = 'operator';
  let level: RegistrationAccessLevel = 'station';
  
  if (email.includes('superadmin')) {
    role = 'super_admin';
    level = 'country';
  } else if (email.includes('region')) {
    role = 'manager';
    level = 'region';
  } else if (email.includes('city')) {
    role = 'engineer';
    level = 'city';
  }

  return {
    id: "mock-user-123",
    email: email,
    role: role,
    level: level,
    first_name: "Mock",
    last_name: "User",
    phone: "+91 9876543210",
    isActive: true,
  };
};

export const MOCK_CITIES: City[] = [
  { city_id: "1", city_name: "Mumbai" },
  { city_id: "2", city_name: "Delhi" },
  { city_id: "3", city_name: "Bangalore" },
];

export const MOCK_STATIONS: Station[] = [
  { station_id: "101", station_name: "Andheri West" },
  { station_id: "102", station_name: "Bandra East" },
  { station_id: "103", station_name: "Powai Lake" },
];

export const MOCK_USERS: ManageableUser[] = [
  {
    id: "user-1",
    email: "manager.mumbai@torent.com",
    role: "engineer",
    level: "city",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phone: "+91 9000000001",
    first_name: "Mumbai",
    last_name: "Manager",
    created_at: new Date().toISOString(),
    access: null
  },
  {
    id: "user-2",
    email: "station.andheri@torent.com",
    role: "operator",
    level: "station",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phone: "+91 9000000002",
    first_name: "Andheri",
    last_name: "Side Op",
    created_at: new Date().toISOString(),
    access: null
  },
  {
    id: "user-3",
    email: "region.west@torent.com",
    role: "manager",
    level: "region",
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phone: "+91 9000000003",
    first_name: "West Zone",
    last_name: "Head",
    created_at: new Date().toISOString(),
    access: null
  }
];

export interface TableRowData {
  id: string;
  name: string;
  gas_in: number;
  gas_out: number;
  country?: string;
  region?: string;
  area?: string;
  cgs?: string;
  station?: string;
  png?: string;
  lcng?: string;
  drs?: string;
}

export const generateMockTableData = (type: string, count = 20): TableRowData[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    name: `${type.toUpperCase()} Device ${i + 1}`,
    gas_in: Math.floor(Math.random() * 5000) + 1000,
    gas_out: Math.floor(Math.random() * 4500) + 500,
    country: "India",
    region: "Maharashtra",
    area: "Mumbai",
    cgs: "CGS Mumbai-Central",
    station: i % 2 === 0 ? "Station-Alpha" : "Station-Beta",
    png: "PNG-Sector-4",
    drs: "DRS-Main-01",
  }));
};

export interface TelemetryPoint {
  timestamp: string;
  value: number;
}

export const generateMockTelemetryData = (tags: string[], start: string, end: string): Record<string, TelemetryPoint[]> => {
  const result: Record<string, TelemetryPoint[]> = {};
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const step = (endTime - startTime) / 20; // 20 data points

  tags.forEach((tag) => {
    result[tag] = Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(startTime + i * step).toISOString(),
      value: Number((Math.random() * 100 + 20).toFixed(2)),
    }));
  });

  return result;
};
