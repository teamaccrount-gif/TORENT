import React, { useMemo } from 'react';
import { Table, Tabs } from 'antd';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface TelemetryPoint {
  timestamp: string;
  value: number;
}

interface DataVisualizerProps {
  data: unknown;
  loading: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const describeDataShape = (value: unknown) => {
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

const unwrapTelemetryPayload = (value: unknown): unknown => {
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

const getStringValue = (record: Record<string, unknown>, keys: string[]): string | null => {
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

const getNumericValue = (record: Record<string, unknown>, keys: string[]): number | null => {
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

const normalizePoint = (value: unknown): TelemetryPoint | null => {
  if (!isRecord(value)) {
    return null;
  }

  const timestamp = getStringValue(value, [
    'timestamp',
    'time',
    'datetime',
    'date',
    'created_at',
    'createdAt',
    'ts',
    'bucket',
    'interval_start',
    'intervalStart',
    'start_time',
    'startTime',
  ]);

  const numericValue = getNumericValue(value, [
    'value',
    'val',
    'reading',
    'reading_value',
    'measurement',
    'delta',
    'y',
    'average',
    'avg',
    'avg_value',
    'result',
    'sum',
  ]);

  if (!timestamp || numericValue === null) {
    return null;
  }

  return {
    timestamp,
    value: numericValue,
  };
};

const isPointLikeArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value) && value.some((item) => normalizePoint(item) !== null);
};

const normalizeTelemetryData = (value: unknown): Record<string, TelemetryPoint[]> => {
  const result: Record<string, TelemetryPoint[]> = {};
  const normalizedValue = unwrapTelemetryPayload(value);

  const addSeriesPoint = (tag: string, point: TelemetryPoint | null) => {
    if (!point || !tag) {
      return;
    }

    if (!result[tag]) {
      result[tag] = [];
    }

    result[tag].push(point);
  };

  const addSeriesPoints = (tag: string, points: unknown[]) => {
    points
      .map((point) => normalizePoint(point))
      .filter((point): point is TelemetryPoint => Boolean(point))
      .forEach((point) => addSeriesPoint(tag, point));
  };

  const visit = (entry: unknown, fallbackTag?: string) => {
    if (Array.isArray(entry)) {
      entry.forEach((item) => visit(item, fallbackTag));
      return;
    }

    if (!isRecord(entry)) {
      return;
    }

    const explicitTag = getStringValue(entry, ['tag', 'name', 'series', 'metric', 'key', 'label']);
    const tag = explicitTag || fallbackTag || null;
    const point = normalizePoint(entry);

    if (tag && point) {
      addSeriesPoint(tag, point);
    }

    const nestedArrays = [
      'points',
      'data',
      'values',
      'series',
      'items',
      'rows',
    ];

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
    // If the whole array is a list of points (e.g. [{"bucket":...}, {"bucket":...}])
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

const COLORS = [
  '#2563eb', // Blue
  '#16a34a', // Green
  '#dc2626', // Red
  '#ca8a04', // Yellow
  '#9333ea', // Purple
  '#0891b2', // Cyan
];

export const DataVisualizer: React.FC<DataVisualizerProps> = ({ data, loading }) => {
  const actualData = useMemo(() => normalizeTelemetryData(data), [data]);
  const tags = Object.keys(actualData).filter((key) => Array.isArray(actualData[key]) && actualData[key].length > 0);
  const dataShape = describeDataShape(actualData);

  console.log('[HISTORY][VISUALIZER] Incoming data shape:', {
    rawKeys: describeDataShape(data).keys,
    actualKeys: dataShape.keys,
    plottableTags: tags,
  });

  // Transform data for Recharts: Merge multiple tag arrays by timestamp
  const chartData = useMemo(() => {
    const timeMap: Record<string, any> = {};
    
    tags.forEach((tag) => {
      actualData[tag].forEach((point: TelemetryPoint) => {
        if (!timeMap[point.timestamp]) {
          timeMap[point.timestamp] = { timestamp: point.timestamp };
        }
        timeMap[point.timestamp][tag] = point.value;
      });
    });

    return Object.values(timeMap).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [data, tags]);

  // Flatten data for the Table
  const tableData = useMemo(() => {
    const flat: any[] = [];
    tags.forEach((tag) => {
      actualData[tag].forEach((point: TelemetryPoint, idx: number) => {
        flat.push({
          key: `${tag}-${idx}`,
          tag,
          timestamp: point.timestamp,
          value: point.value,
        });
      });
    });
    return flat.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [actualData, tags]);

  // Generic fallback data for when timeseries normalization fails or for raw inspection
  const genericData = useMemo(() => {
    const unwrapped = unwrapTelemetryPayload(data);
    if (Array.isArray(unwrapped)) return unwrapped;
    
    // If it's an object of arrays, flatten it
    if (isRecord(unwrapped)) {
      const flattened: any[] = [];
      Object.entries(unwrapped).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          val.forEach((item, idx) => {
            if (isRecord(item)) {
              flattened.push({ _source_tag: key, _row_index: idx, ...item });
            } else {
              flattened.push({ _source_tag: key, _row_index: idx, value: val });
            }
          });
        }
      });
      return flattened;
    }
    
    return isRecord(unwrapped) ? [unwrapped] : [];
  }, [data]);

  const genericColumns = useMemo(() => {
    if (genericData.length === 0) return [];
    
    // Get all unique keys from first 10 rows to build columns
    const keys = new Set<string>();
    genericData.slice(0, 10).forEach(row => {
      if (isRecord(row)) {
        Object.keys(row).forEach(k => keys.add(k));
      }
    });

    return Array.from(keys).map(key => ({
      title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      dataIndex: key,
      key: key,
      ellipsis: true,
      render: (val: any) => {
        if (typeof val === 'object' && val !== null) return JSON.stringify(val);
        return String(val ?? '');
      },
      sorter: (a: any, b: any) => {
        const valA = a[key];
        const valB = b[key];
        if (typeof valA === 'number' && typeof valB === 'number') return valA - valB;
        return String(valA).localeCompare(String(valB));
      }
    }));
  }, [genericData]);

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (ts: string) => new Date(ts).toLocaleString(),
      sorter: (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'Tag',
      dataIndex: 'tag',
      key: 'tag',
      filters: tags.map(t => ({ text: t, value: t })),
      onFilter: (value: any, record: any) => record.tag === value,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (val: number) => <span className="font-mono font-bold text-blue-600">{val}</span>,
      sorter: (a: any, b: any) => a.value - b.value,
    },
  ];

  if (loading) return (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500 font-medium">Processing Telemetry...</span>
      </div>
    </div>
  );

  const hasPlottableData = tags.length > 0;

  const tabItems = [
    {
      key: 'chart',
      label: 'Visual Trend',
      disabled: !hasPlottableData,
      children: hasPlottableData ? (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
              />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip 
                labelFormatter={(ts) => new Date(ts).toLocaleString()}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              {tags.map((tag, idx) => (
                <Line
                  key={tag}
                  type="monotone"
                  dataKey={tag}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-gray-500 font-medium">No plottable time-series found.</p>
          <p className="text-xs text-gray-400 mt-2 max-w-xs">
            Data was received, but columns like "timestamp" or "value" were missing. Please check the "Raw Data" tab.
          </p>
        </div>
      )
    },
    {
      key: 'table',
      label: 'Data Log',
      disabled: !hasPlottableData,
      children: (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table 
            dataSource={tableData} 
            columns={columns} 
            pagination={{ pageSize: 15 }}
            size="middle"
          />
        </div>
      )
    },
    {
      key: 'raw',
      label: 'Raw Data',
      children: (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500">
            <span>Dynamic inspection of backend payload</span>
            <span className="font-mono">{genericData.length} records found</span>
          </div>
          <Table 
            dataSource={genericData} 
            columns={genericColumns} 
            pagination={{ pageSize: 15 }}
            size="small"
            scroll={{ x: 'max-content' }}
            rowKey={(record, idx) => record.id ?? record._row_index ?? idx}
          />
        </div>
      )
    }
  ];

  return (
    <div className="mt-8 space-y-6 text-gray-900">
      <Tabs
        defaultActiveKey={hasPlottableData ? "chart" : "raw"}
        type="card"
        className="history-tabs"
        items={tabItems}
      />
    </div>
  );
};
