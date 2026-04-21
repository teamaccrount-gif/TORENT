import { isRecord, getStringValue, getNumericValue } from './telemetryUtils';

export interface TelemetryPoint {
  timestamp: string;
  value: number;
}

/**
 * unwrapTelemetryPayload
 * strips away standard API envelopes like { success: true, data: [...] }
 */
export const unwrapTelemetryPayload = (value: unknown): unknown => {
  if (!isRecord(value)) {
    return value;
  }

  if ('success' in value && 'data' in value) {
    return unwrapTelemetryPayload(value.data);
  }

  if ('payload' in value) {
    return unwrapTelemetryPayload(value.payload);
  }

  return value;
};

/**
 * normalizePoint
 * attempts to extract a valid TelemetryPoint from a record
 */
export const normalizePoint = (value: unknown): TelemetryPoint | null => {
  if (!isRecord(value)) {
    return null;
  }

  const timestamp = getStringValue(value, [
    'timestamp', 'time', 'datetime', 'date', 'created_at', 'createdAt', 
    'ts', 'bucket', 'interval_start', 'intervalStart', 'start_time', 'startTime'
  ]);

  const numericValue = getNumericValue(value, [
    'value', 'val', 'reading', 'reading_value', 'measurement', 'delta', 
    'y', 'average', 'avg', 'avg_value', 'result', 'sum'
  ]);

  if (!timestamp || numericValue === null) {
    return null;
  }

  return {
    timestamp,
    value: numericValue,
  };
};

/**
 * isPointLikeArray
 * checks if an array contains objects that look like telemetry points
 */
export const isPointLikeArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value) && value.some((item) => normalizePoint(item) !== null);
};

/**
 * normalizeTelemetryData
 * recursively traverse an unknown data structure to extract plottable time-series arrays
 */
export const normalizeTelemetryData = (value: unknown): Record<string, TelemetryPoint[]> => {
  const result: Record<string, TelemetryPoint[]> = {};
  const normalizedValue = unwrapTelemetryPayload(value);

  const addSeriesPoint = (tag: string, point: TelemetryPoint | null) => {
    if (!point || !tag) return;
    if (!result[tag]) result[tag] = [];
    result[tag].push(point);
  };

  const addSeriesPoints = (tag: string, points: unknown[]) => {
    points
      .map((p) => normalizePoint(p))
      .filter((p): p is TelemetryPoint => Boolean(p))
      .forEach((p) => addSeriesPoint(tag, p));
  };

  const visit = (entry: unknown, fallbackTag?: string) => {
    if (Array.isArray(entry)) {
      entry.forEach((item) => visit(item, fallbackTag));
      return;
    }

    if (!isRecord(entry)) return;

    const explicitTag = getStringValue(entry, ['tag', 'name', 'series', 'metric', 'key', 'label']);
    const tag = explicitTag || fallbackTag || null;
    const point = normalizePoint(entry);

    if (tag && point) {
      addSeriesPoint(tag, point);
    }

    const nestedArrays = ['points', 'data', 'values', 'series', 'items', 'rows'];

    for (const key of nestedArrays) {
      const nested = entry[key];
      if (Array.isArray(nested) && tag) {
        if (isPointLikeArray(nested)) {
          addSeriesPoints(tag, nested);
        } else {
          nested.forEach((item) => visit(item, tag));
        }
      }
    }
  };

  if (Array.isArray(normalizedValue)) {
    if (isPointLikeArray(normalizedValue)) {
      addSeriesPoints('Telemetry', normalizedValue);
      return result;
    }

    normalizedValue.forEach((item, index) => {
      if (isRecord(item)) {
        const tag = getStringValue(item, ['tag', 'name', 'series', 'metric', 'key', 'label']) || `series-${index + 1}`;
        const nested = item.points ?? item.data ?? item.values ?? item.series ?? item.items ?? item.rows;
        if (Array.isArray(nested)) {
          visit(nested, tag);
          return;
        }
        visit(item, tag);
      }
    });
    return result;
  }

  if (isRecord(normalizedValue)) {
    const recordKeys = Object.keys(normalizedValue);
    const hasSeriesArrays = recordKeys.some((key) => Array.isArray(normalizedValue[key]));

    if (hasSeriesArrays) {
      for (const [key, nested] of Object.entries(normalizedValue)) {
        if (Array.isArray(nested)) {
          if (isPointLikeArray(nested)) {
            addSeriesPoints(key, nested);
          } else {
            nested.forEach((item) => visit(item, key));
          }
        } else {
          visit(nested, key);
        }
      }
      return result;
    }

    visit(normalizedValue);
  }

  return result;
};
