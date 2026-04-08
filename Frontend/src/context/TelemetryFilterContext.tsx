import React, { createContext, useContext, type ReactNode } from "react";
import type { TableRow, LatestEntry } from "../ModelsLogic/RawDataModel";
import type { LiveValueMap } from "../hooks/useTelemetryWatcher";

export interface TelemetryPoint {
  timestamp: string;
  value: number;
}

export type TelemetryChartData = Record<string, TelemetryPoint[]> | null;

export interface SelectedTelemetryRow {
  tag: string;
  id: number;
}

export interface TelemetryFilterContextValue {
  tableData: TableRow[];
  tagsLoading: boolean;
  selectedTags: string[];
  handleTagSelect: (tag: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  liveValues: LiveValueMap;
  connected: boolean;
  latestValues: LatestEntry[] | null;
  selectedRows: SelectedTelemetryRow[];
  onFetch: () => void | Promise<void>;
  loading: boolean;
  chartData: TelemetryChartData;
  errorMessage: string | null;
}

const TelemetryFilterContext = createContext<TelemetryFilterContextValue | undefined>(undefined);

interface TelemetryFilterProviderProps {
  value: TelemetryFilterContextValue;
  children: ReactNode;
}

export const TelemetryFilterProvider: React.FC<TelemetryFilterProviderProps> = ({ value, children }) => {
  return (
    <TelemetryFilterContext.Provider value={value}>
      {children}
    </TelemetryFilterContext.Provider>
  );
};

export const useTelemetryFilter = (): TelemetryFilterContextValue => {
  const context = useContext(TelemetryFilterContext);

  if (!context) {
    throw new Error("useTelemetryFilter must be used within a TelemetryFilterProvider");
  }

  return context;
};
