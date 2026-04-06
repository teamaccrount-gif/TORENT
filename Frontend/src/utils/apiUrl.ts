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
} as const;

export default API_URLS;
