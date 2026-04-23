import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllowedView } from '../../config/accessControl';
import { useDynamicData } from '../../hooks/useDynamicData';
import { canViewTableAtLevel, getEffectiveLevel } from '../../utils/registrationHelpers';
import { TABLE_LEVELS } from '../../config/permissions';
import { CommonTable } from '../tables/CommonTable';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Activity, ShieldCheck, Users } from 'lucide-react';

import { Skeleton } from 'boneyard-js/react';

export const DynamicTableView: React.FC = () => {
  const { view } = useParams<{ view: string }>();
  const navigate = useNavigate();
  const { user, role: authRole } = useAuth();
  
  const userLevel = getEffectiveLevel(user);
  const role = authRole || '';
  const allowedView = getAllowedView(role, userLevel);

  // Permission Guard: Allow any view at or below the user's level
  useEffect(() => {
    if (view) {
      const requestedViewLevel = TABLE_LEVELS[view] || 'station';
      const isAllowed = canViewTableAtLevel(userLevel, requestedViewLevel);
      
      if (!isAllowed) {
        console.warn(`[DASHBOARD] Access denied to view ${view} for level ${userLevel}`);
        navigate(`/dashboard/${allowedView}`, { replace: true });
      }
    }
  }, [view, userLevel, allowedView, navigate]);

  const activeView = view || allowedView;
  const { data, loading, hasAction } = useDynamicData(activeView);

  if (!user) return null;

  const roleText = role.replace(/_/g, ' ');
  const viewTitle = activeView === 'area' ? 'cities' : activeView;

  return (
    <Skeleton name="dashboard-view" loading={loading} transition>
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Dynamic Header & Contextual Scope */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-gray-900 capitalize tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                  {roleText} Dashboard
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  Welcome back, <span className="font-semibold text-gray-900">{user.email}</span>.
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                     <p className="flex items-center gap-1.5 font-medium">Access: <span className="text-blue-600 uppercase">{userLevel}</span></p>
                     <p className="flex items-center gap-1.5 font-medium">Monitoring: <span className="text-indigo-600 uppercase">{viewTitle}</span></p>
                  </div>
                </CardDescription>
              </div>

              <Breadcrumb className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="text-gray-500">India</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize font-semibold text-blue-600">{viewTitle}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </CardHeader>
        </Card>

        {/* Dynamic Actions Quick Links */}
        {['super_admin', 'super admin', 'admin'].includes(role) && (
          <Card className="max-w-md border-gray-200 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                Team Management
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                View and configure access for operators directly within your jurisdiction parameters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" onClick={() => navigate('/manage')}>
                Manage Users
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dynamic Data Table Rendering */}
        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </div>
              <CardTitle className="text-lg font-semibold capitalize">
                Monitoring {viewTitle} Data
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!hasAction ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <AlertCircle className="h-10 w-10 text-gray-300" />
                <p className="text-muted-foreground font-medium">No system configuration found for view: {activeView}</p>
              </div>
            ) : (
              <>
                <CommonTable type={activeView} data={data} loading={loading} />
                {data.length === 0 && !loading && (
                   <div className="p-12 text-center flex flex-col items-center gap-3 bg-gray-50/30">
                      <Activity className="h-10 w-10 text-gray-200" />
                      <p className="text-sm text-muted-foreground italic">
                        No data points available at your assigned operational scope.
                      </p>
                   </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Skeleton>
  );
};

export default DynamicTableView;
