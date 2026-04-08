const API_BASE = import.meta.env.VITE_BACKEND_ENDPOINT ;

export const API_URLS = {
  // Tag endpoint - fetches available tags
  TAGS: `${API_BASE}/api/v1/filter/tag`,

  // Raw data endpoint - fetches raw time-series data
  RAW_DATA: `${API_BASE}/api/v1/filter/raw`,

  // Aggregated data endpoint - fetches aggregated/delta time-series data
  AGGREGATED_DATA: `${API_BASE}/api/v1/filter/aggregation`,

  // Delta data endpoints
  DELTA_DATA: `${API_BASE}/api/v1/filter/delta`,

  // Latest values endpoint
  LATEST: `${API_BASE}/api/v1/filter/latest`,

  // Auth & Registration endpoints
  LOGIN: `${API_BASE}/api/v1/auth/login`,
  REGISTER_RM: `${API_BASE}/api/v1/auth/register-rm`,
  REGISTER_CM: `${API_BASE}/api/v1/auth/register-cm`,
  REGISTER_SM: `${API_BASE}/api/v1/auth/register-sm`,

  // Meta endpoints for assignments
  FETCH_CITIES: `${API_BASE}/api/v1/meta/cities`,
  FETCH_STATIONS: `${API_BASE}/api/v1/meta/stations`,

  // Management endpoints
  FETCH_USERS: `${API_BASE}/api/v1/manage/users`,
  FETCH_USER_DETAIL: `${API_BASE}/api/v1/manage/users/detail`,
  UPDATE_USER: `${API_BASE}/api/v1/manage/users/update`,
  TOGGLE_USER_STATUS: `${API_BASE}/api/v1/manage/users/toggle-status`,

  // Tables endpoints
  TABLES_COUNTRY: `${API_BASE}/api/v1/tables/country`,
  TABLES_REGION: `${API_BASE}/api/v1/tables/region`,
  TABLES_AREA: `${API_BASE}/api/v1/tables/area`,
  TABLES_STATION: `${API_BASE}/api/v1/tables/station`,
  TABLES_CGS: `${API_BASE}/api/v1/tables/cgs`,
  TABLES_DEVICE: `${API_BASE}/api/v1/tables/device`,
  TABLES_PNG: `${API_BASE}/api/v1/tables/png`,
  TABLES_LCNG: `${API_BASE}/api/v1/tables/lcng`,
  TABLES_INDUSTRIAL: `${API_BASE}/api/v1/tables/industrial`,
  TABLES_COMMERCIAL: `${API_BASE}/api/v1/tables/commercial`,
  TABLES_DISPENSER: `${API_BASE}/api/v1/tables/dispenser`,
  TABLE_COMPRESSOR: `${API_BASE}/api/v1/tables/compressor`,
  TABLE_DRS: `${API_BASE}/api/v1/tables/drs`,
  TABLE_DOMESTIC: `${API_BASE}/api/v1/tables/domestic`,
} as const;

export default API_URLS;
