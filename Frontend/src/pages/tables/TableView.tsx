import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../Redux/Store';
import { PERMISSIONS, TABLE_LEVELS } from '../../config/permissions';
import { canViewTableAtLevel } from '../../utils/registrationHelpers';
import { CommonTable } from '../../components/tables/CommonTable';
import * as actions from '../../Redux/Slices/tablesSlice';
import { useAuth } from '../../hooks/useAuth';

const TableView: React.FC = () => {
  const { tableType } = useParams<{ tableType: string }>();
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const slug = tableType?.toLowerCase() || '';
  const userLevel = user?.level || 'station';
  const tableLevel = TABLE_LEVELS[slug];
  const isAllowed = tableLevel ? canViewTableAtLevel(userLevel, tableLevel) : false;

  const actionName = actionNameGenerator(slug);
  const action = (actions as any)[actionName];

  const tableData = useAppSelector((state) => (state.tablesSlice.data as any)[actionName]);
  const loading = useAppSelector((state) => (state.tablesSlice.loading as any)[actionName]) === 'pending';

  useEffect(() => {
    if (action && isAllowed) {
      dispatch(action());
    }
  }, [slug, isAllowed, dispatch, action]);

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!action) {
    return <div className="p-8 text-red-500 font-medium">Table type '{tableType}' not found.</div>;
  }

  const formatTitle = (s: string) => s.replace('_', ' ').toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Technical Inventory</h1>
        <p className="text-sm text-gray-500">
          Showing hierarchical data for <span className="font-bold text-blue-600">{formatTitle(slug)}</span> level.
        </p>
      </div>

      <CommonTable 
        type={slug} 
        data={tableData?.success ? tableData.data : []} 
        loading={loading} 
      />
    </div>
  );
};

// Helper to generate the fetchActionName from slug
function actionNameGenerator(slug: string) {
  if (!slug) return '';
  return `fetch${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
}

export default TableView;
