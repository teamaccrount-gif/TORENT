const API_BASE = import.meta.env.VITE_BACKEND_ENDPOINT;

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
  REFRESH: `${API_BASE}/api/v1/auth/refresh`,
  LOGOUT: `${API_BASE}/api/v1/auth/logout`,
  FETCH_ROLES: `${API_BASE}/api/v1/users/role`,
  
  ADD_USER: `${API_BASE}/api/v1/users`,

  // Management endpoints
  FETCH_USERS: `${API_BASE}/api/v1/users`,
  FETCH_USER_DETAIL: `${API_BASE}/api/v1/users`,
  UPDATE_USER: `${API_BASE}/api/v1/users`,
  DELETE_USER: `${API_BASE}/api/v1/users`,

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

  //map data apis
  MAP_DATA: `${API_BASE}/api/v1/gis/map`,

  //drop down endpoints
  REGION_DROPDOWN: `${API_BASE}/api/v1/tables/all-regions`,
  AREA_DROPDOWN: `${API_BASE}/api/v1/tables/areas-by-region/:region`,
  STATION_DROPDOWN: `${API_BASE}/api/v1/tables/stations-by-area/:area`,
} as const;

export default API_URLS;
