/**
 * isRecord
 * checks if a value is an object, not an array and not null
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

/**
 * describeDataShape
 * provides basic structural information about unknown data
 */
export const describeDataShape = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return {
      kind: typeof value,
      keys: [],
    };
  }

  const record = value as Record<string, unknown>;
  return {
    kind: Array.isArray(value) ? 'array' : 'object',
    keys: Object.keys(record),
  };
};

/**
 * getStringValue
 * utility to extract a non-empty string from a record using fallback keys
 */
export const getStringValue = (record: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
};

/**
 * getNumericValue
 * utility to extract a finite number from a record using fallback keys
 */
export const getNumericValue = (record: Record<string, unknown>, keys: string[]): number | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
};
