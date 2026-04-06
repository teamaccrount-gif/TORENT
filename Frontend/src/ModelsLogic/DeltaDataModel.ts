import axios from "axios";
import API_URLS from "../utils/apiUrl";

export interface ChartDataResponse {
  [key: string]: unknown;
}


export type TimeUnit = "seconds" | "minutes" | "hours" | "days";

export interface IntervalOption {
  label: string;
  value: number;
  unit: TimeUnit;
}

export interface DeltaDataParams {
  tags: string[];
  startTime: string;
  endTime: string;
  intervalValue: number;
  intervalUnit: TimeUnit;
}

export const toSeconds = (value: number, unit: TimeUnit): number => {
  const multipliers: Record<TimeUnit, number> = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400,
  };
  return Math.round(value * multipliers[unit]);
};

export const INTERVAL_OPTIONS: IntervalOption[] = [
  { label: "1 Min", value: 1, unit: "minutes" },
  { label: "15 Min", value: 15, unit: "minutes" },
  { label: "30 Min", value: 30, unit: "minutes" },
  { label: "1 Hour", value: 1, unit: "hours" },
  { label: "8 Hours", value: 8, unit: "hours" },
  { label: "1 Day", value: 1, unit: "days" },
];

export const fetchDeltaData = async (params: DeltaDataParams): Promise<ChartDataResponse> => {
  const startISO = new Date(params.startTime).toISOString();
  const endISO = new Date(params.endTime).toISOString();
  const intervalInSeconds = toSeconds(params.intervalValue, params.intervalUnit);

  const plainParams = {
    tags: params.tags,
    start: startISO,
    end: endISO,
    interval: intervalInSeconds,
  };

  console.log("Fetching DELTA data with payload:", plainParams);

  const response = await axios.post<ChartDataResponse>(API_URLS.DELTA_DATA, plainParams);

  console.log("data", response.data)
  return response.data;
};
    