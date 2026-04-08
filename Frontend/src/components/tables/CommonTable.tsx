import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface CommonTableProps {
  type: string;
  data: any[];
  loading: boolean;
}

export const CommonTable: React.FC<CommonTableProps> = ({ type, data, loading }) => {
  
  const getColumns = (tableType: string): ColumnsType<any> => {
    const baseColumns: ColumnsType<any> = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: 'Gas In',
        dataIndex: 'gas_in',
        key: 'gas_in',
        render: (val) => <span className="font-mono text-blue-600 font-medium">{val.toLocaleString()}</span>,
        sorter: (a, b) => a.gas_in - b.gas_in,
      },
      {
        title: 'Gas Out',
        dataIndex: 'gas_out',
        key: 'gas_out',
        render: (val) => <span className="font-mono text-green-600 font-medium">{val.toLocaleString()}</span>,
        sorter: (a, b) => a.gas_out - b.gas_out,
      },
    ];

    const hierarchy: ColumnsType<any> = [];

    // Add Parents based on drill-down level
    const addCountry = () => hierarchy.push({ title: 'Country', dataIndex: 'country', key: 'country' });
    const addRegion = () => hierarchy.push({ title: 'Region', dataIndex: 'region', key: 'region' });
    const addArea = () => hierarchy.push({ title: 'Area', dataIndex: 'area', key: 'area' });
    const addCgs = () => hierarchy.push({ title: 'CGS', dataIndex: 'cgs', key: 'cgs' });
    const addStation = () => hierarchy.push({ title: 'Station', dataIndex: 'station', key: 'station' });
    const addPng = () => hierarchy.push({ title: 'PNG', dataIndex: 'png', key: 'png' });
    const addDrs = () => hierarchy.push({ title: 'DRS', dataIndex: 'drs', key: 'drs' });

    const slug = tableType.toLowerCase();

    if (['region', 'area', 'cgs', 'station', 'png', 'lcng', 'compressor', 'dispenser', 'device', 'drs', 'industrial', 'commercial', 'domestic'].includes(slug)) addCountry();
    if (['area', 'cgs', 'station', 'png', 'lcng', 'compressor', 'dispenser', 'device', 'drs', 'industrial', 'commercial', 'domestic'].includes(slug)) addRegion();
    if (['cgs', 'station', 'png', 'lcng', 'compressor', 'dispenser', 'device', 'drs', 'industrial', 'commercial', 'domestic'].includes(slug)) addArea();
    if (['station', 'png', 'lcng', 'compressor', 'dispenser', 'device', 'drs', 'industrial', 'commercial', 'domestic'].includes(slug)) addCgs();
    
    if (['compressor', 'dispenser', 'device'].includes(slug)) addStation();
    if (slug === 'drs' || ['industrial', 'commercial', 'domestic'].includes(slug)) addPng();
    if (['industrial', 'commercial', 'domestic'].includes(slug)) addDrs();

    return [...baseColumns, ...hierarchy];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
      <Table 
        dataSource={data} 
        columns={getColumns(type)} 
        loading={loading}
        rowKey="id"
        pagination={{ 
          pageSize: 10,
          showSizeChanger: false,
          className: "px-6 py-4 border-t border-gray-50"
        }}
        className="technical-table"
      />
    </div>
  );
};
