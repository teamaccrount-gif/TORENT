import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../Redux/Store';
import { TABLE_LEVELS } from '../../config/permissions';
import { canViewTableAtLevel, getEffectiveLevel } from '../../utils/registrationHelpers';
import { CommonTable } from '../../components/tables/CommonTable';
import * as actions from '../../Redux/Slices/tablesSlice';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Database } from 'lucide-react';

import { Skeleton } from 'boneyard-js/react';

const TableView: React.FC = () => {
  const { tableType } = useParams<{ tableType: string }>();
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const slug = tableType?.toLowerCase() || '';
  const userLevel = getEffectiveLevel(user);
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
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto mt-10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Table type '{tableType}' not found in technical registry.</AlertDescription>
      </Alert>
    );
  }

  const formatTitle = (s: string) => s.replace('_', ' ').toUpperCase();

  return (
    <Skeleton name="technical-table" loading={loading} transition>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Technical Inventory</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Database className="h-4 w-4 text-blue-500" />
            Showing hierarchical data for <span className="font-bold text-blue-600">{formatTitle(slug)}</span> level.
          </p>
        </div>

        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
            <CardTitle className="text-lg font-semibold">{formatTitle(slug)} Records</CardTitle>
            <CardDescription>Live system configuration and metadata for the selected scope.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CommonTable 
              type={slug} 
              data={tableData?.success ? tableData.data : []} 
              loading={loading} 
            />
          </CardContent>
        </Card>
      </div>
    </Skeleton>
  );
};

// Helper to generate the fetchActionName from slug
function actionNameGenerator(slug: string) {
  if (!slug) return '';
  return `fetch${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
}

export default TableView;
