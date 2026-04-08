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

export const ROLE_LEVEL_MAP: Record<Exclude<Role, "SUPER_ADMIN">, RegistrationAccessLevel> = {
  ADMIN: "region_level",
  REGION_MANAGER: "region_level",
  CITY_MANAGER: "city_level",
  STATION_MANAGER: "station_level",
};

const ROLE_MATCHERS: Record<Exclude<Role, "SUPER_ADMIN">, string[]> = {
  ADMIN: ["admin", "super_admin", "super admin"],
  REGION_MANAGER: ["region_manager", "region manager", "regional manager", "rm"],
  CITY_MANAGER: ["city_manager", "city manager", "cm"],
  STATION_MANAGER: ["station_manager", "station manager", "sm"],
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
