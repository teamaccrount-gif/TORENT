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
  }, [data, tags]);

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

  if (tags.length === 0) {
    console.error('[HISTORY][VISUALIZER] No plottable tag arrays found in response.', {
      rawData: data,
      actualData,
      shape: dataShape,
    });

    return (
      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        History data was fetched, but the response format is not chart-compatible. Check the console for the backend payload and parsed shape.
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <Tabs
        defaultActiveKey="chart"
        type="card"
        className="history-tabs"
        items={[
          {
            key: 'chart',
            label: 'Visual Trend',
            children: (
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
            )
          },
          {
            key: 'table',
            label: 'Data Log',
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
          }
        ]}
      />
    </div>
  );
};
