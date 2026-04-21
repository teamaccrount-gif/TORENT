import React from 'react';
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

interface TelemetryChartProps {
  chartData: any[];
  tags: string[];
  colors: string[];
}

const TelemetryChart: React.FC<TelemetryChartProps> = ({ chartData, tags, colors }) => {
  if (tags.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500 font-medium">No plottable time-series found.</p>
        <p className="text-xs text-gray-400 mt-2 max-w-xs">
          Data was received, but columns like "timestamp" or "value" were missing. Please check the "Raw Data" tab.
        </p>
      </div>
    );
  }

  return (
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
              stroke={colors[idx % colors.length]}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1000}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TelemetryChart;
