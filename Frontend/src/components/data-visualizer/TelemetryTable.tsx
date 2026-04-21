import React from 'react';
import { Table } from 'antd';

interface TelemetryTableProps {
  tableData: any[];
  columns: any[];
  genericData: any[];
  genericColumns: any[];
  isRaw?: boolean;
}

export const TelemetryTable: React.FC<TelemetryTableProps> = ({ 
  tableData, 
  columns, 
  genericData, 
  genericColumns,
  isRaw = false
}) => {
  if (isRaw) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-gray-900">
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
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Table 
        dataSource={tableData} 
        columns={columns} 
        pagination={{ pageSize: 15 }}
        size="middle"
      />
    </div>
  );
};

export default TelemetryTable;
