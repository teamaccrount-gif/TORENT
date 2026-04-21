import React, { useMemo } from 'react';
import { Tabs } from 'antd';
import { normalizeTelemetryData, unwrapTelemetryPayload, type TelemetryPoint } from './telemetryParser';
import { isRecord, describeDataShape } from './telemetryUtils';
import TelemetryChart from './TelemetryChart';
import TelemetryTable from './TelemetryTable';

interface DataVisualizerProps {
  data: unknown;
  loading: boolean;
}

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
  
  if (process.env.NODE_ENV === 'development') {
    const dataShape = describeDataShape(actualData);
    console.log('[HISTORY][VISUALIZER] Incoming data shape:', {
      rawKeys: describeDataShape(data).keys,
      actualKeys: dataShape.keys,
      plottableTags: tags,
    });
  }

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
  }, [actualData, tags]);

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
      children: <TelemetryChart chartData={chartData} tags={tags} colors={COLORS} />
    },
    {
      key: 'table',
      label: 'Data Log',
      disabled: !hasPlottableData,
      children: <TelemetryTable tableData={tableData} columns={columns} genericData={[]} genericColumns={[]} />
    },
    {
      key: 'raw',
      label: 'Raw Data',
      children: <TelemetryTable tableData={[]} columns={[]} genericData={genericData} genericColumns={genericColumns} isRaw />
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

export default DataVisualizer;
