import axios from "axios";
import API_URLS from "../utils/apiUrl";

export interface TableRow {
  tag: string;
  id: number;  // ← changed from telemetry_id
  country?: string;
  region?: string;
  area?: string;
  cgs?: string;
  station?: string;
  compressor?: string;
  point?: string;
  parameter?: string;
}

export interface LatestEntry {
  tag: string;
  id: number;
  value: number;
  quality: number;
  timestamp: string;
}
export interface ChartDataResponse {
  [key: string]: unknown;
}

export interface RawDataParams {
  tags: string[];
  startTime: string;
  endTime: string;
}


export const fetchTags = async (): Promise<TableRow[]> => {
  const response = await axios.get(API_URLS.TAGS);
  const data = response.data;
  console.log("[HISTORY][TAGS] Response data:", data);

  // If data is already an array of tags, return it directly
  if (Array.isArray(data)) {
    return data;
  }

  // If data is an object with a tag field
  if (data && typeof data === "object" && "tag" in (data as object)) {
    return (data as { tag: TableRow[] }).tag;
  }

  // Fallback
  return data as TableRow[];
};


export const fetchRawData = async (params: RawDataParams): Promise<ChartDataResponse> => {
  const startISO = new Date(params.startTime).toISOString();
  const endISO = new Date(params.endTime).toISOString();

  const plainParams = {
    tags: params.tags,
    start: startISO,
    end: endISO,
  };

  console.log("[HISTORY][RAW] Request payload:", plainParams);

  const response = await axios.post<ChartDataResponse>(API_URLS.RAW_DATA, plainParams);
  console.log("[HISTORY][RAW] Response data:", response.data);

  return response.data;
};
