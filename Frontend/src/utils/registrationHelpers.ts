import type {
  AreaOption,
  RegionOption,
  RegistrationAccessLevel,
  RegistrationStationOption,
  Role,
  RoleOption,
} from "../types";

const getRecordValue = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
};

const toArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && "data" in (value as Record<string, unknown>)) {
    const nested = (value as Record<string, unknown>).data;
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
};

export const ROLE_LEVEL_MAP: Record<Role, RegistrationAccessLevel> = {
  'super_admin': 'country',
  'admin': 'country',
  'manager': 'region',
  'engineer': 'city',
  'operator': 'station',
};

const ROLE_MATCHERS: Record<Role, string[]> = {
  'super_admin': ["super admin", "superadmin", "sa"],
  'admin': ["admin", "administrator"],
  'manager': ["manager", "mgr"],
  'engineer': ["engineer", "eng"],
  'operator': ["operator", "op"],
};

export const LEVEL_HIERARCHY: RegistrationAccessLevel[] = ['country', 'region', 'city', 'station'];

export const canViewTableAtLevel = (userLevel: RegistrationAccessLevel, tableLevel: RegistrationAccessLevel): boolean => {
  const userIdx = LEVEL_HIERARCHY.indexOf(userLevel);
  const tableIdx = LEVEL_HIERARCHY.indexOf(tableLevel);
  
  // Rule: Cannot see table level X or above.
  // Must see tables BELOW user level.
  // lower index = higher level (country=0, region=1...)
  // So tableIdx must be GREATER than userIdx.
  return tableIdx > userIdx;
};

const uniqueBy = <T,>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const normalizeRoles = (value: unknown): RoleOption[] => {
  return uniqueBy(
    toArray<Record<string, unknown>>(value)
      .map((record) => ({
        role_id: getRecordValue(record, ["id", "role_id"]),
        role_name: getRecordValue(record, ["role", "role_name", "name"]),
      }))
      .filter((role) => role.role_id && role.role_name),
    (role) => role.role_id
  );
};

export const normalizeRegions = (value: unknown): RegionOption[] => {
  return uniqueBy(
    toArray<Record<string, unknown>>(value)
      .map((record) => ({
        region_id: getRecordValue(record, ["id", "region_id"]),
        region_name: getRecordValue(record, ["name", "region_name"]),
      }))
      .filter((region) => region.region_id && region.region_name),
    (region) => region.region_id
  );
};

export const normalizeAreas = (value: unknown): AreaOption[] => {
  return uniqueBy(
    toArray<Record<string, unknown>>(value)
      .map((record) => ({
        area_id: getRecordValue(record, ["id", "area_id"]),
        area_name: getRecordValue(record, ["name", "area_name"]),
        region_name: getRecordValue(record, ["region", "region_name"]),
      }))
      .filter((area) => area.area_id && area.area_name),
    (area) => `${area.region_name}-${area.area_name}`
  );
};

export const normalizeStations = (value: unknown): RegistrationStationOption[] => {
  return uniqueBy(
    toArray<Record<string, unknown>>(value)
      .map((record) => ({
        station_id: getRecordValue(record, ["id", "station_id"]),
        station_name: getRecordValue(record, ["name", "station_name"]),
        area_name: getRecordValue(record, ["area", "area_name"]),
      }))
      .filter((station) => station.station_id && station.station_name),
    (station) => `${station.area_name}-${station.station_name}`
  );
};

export const getRoleOptionsForTarget = (
  roles: RoleOption[],
  targetRole: Exclude<Role, "SUPER_ADMIN">
): RoleOption[] => {
  const matchers = ROLE_MATCHERS[targetRole];
  const filtered = roles.filter((role) => {
    const normalized = role.role_name.toLowerCase().trim();
    return matchers.includes(normalized);
  });

  return filtered.length > 0 ? filtered : roles;
};
