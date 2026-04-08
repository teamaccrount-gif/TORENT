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
  data: Record<string, TelemetryPoint[]>;
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
  const tags = Object.keys(data);

  // Transform data for Recharts: Merge multiple tag arrays by timestamp
  const chartData = useMemo(() => {
    const timeMap: Record<string, any> = {};
    
    tags.forEach((tag) => {
      data[tag].forEach((point) => {
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
      data[tag].forEach((point, idx) => {
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

  if (tags.length === 0) return null;

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
