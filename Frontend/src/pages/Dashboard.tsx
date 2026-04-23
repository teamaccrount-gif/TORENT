import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user || !role) {
    return null;
  }

  const roleText = role.replace(/_/g, ' ');

  let primaryScopeText = "Welcome to your operations dashboard.";
  if (role === 'super_admin' || role === 'admin') primaryScopeText = "You have full country-level access to the system.";
  else if (role === 'manager') primaryScopeText = `You are managing data across your assigned regions.`;
  else if (role === 'engineer') primaryScopeText = `You are managing operations for your assigned city.`;
  else if (role === 'operator') primaryScopeText = "You are currently monitoring your assigned station data.";

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-6 border-b border-gray-50 bg-gray-50/30">
          <CardTitle className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
            {roleText} Dashboard
          </CardTitle>
          <CardDescription className="text-gray-500 text-sm mt-1">
            Welcome back, <span className="font-semibold text-gray-900">{user.email}</span>.
            <p className="mt-0.5">{primaryScopeText}</p>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<<<<<<< HEAD
        <Card className="flex flex-col hover:shadow-md transition-all duration-300 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Data Analytics</CardTitle>
            <CardDescription className="text-gray-500 text-sm leading-relaxed">
              Access the telemetry filters and review precise data sets across raw, aggregated, and delta modes.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-2">
            <Button variant="default" className="w-fit px-6" onClick={() => navigate('/filters/raw')}>
              View Data
=======
        <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200 p-6 flex flex-col items-start transition ease-in-out hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Data Analytics</h2>
          <p className="mt-1 text-sm text-gray-500 flex-1">
            Access the telemetry filters and review precise data sets across raw, aggregated, and delta modes.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/filters/raw')}>
            View Data
          </Button>
        </div>

        {['super admin', 'admin'].includes(role) && (
          <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200 p-6 flex flex-col items-start transition ease-in-out hover:shadow-md">
            <h2 className="text-lg font-medium text-gray-900">Team Management</h2>
            <p className="mt-1 text-sm text-gray-500 flex-1">
              View and configure access for operators directly within your jurisdiction parameters.
            </p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/manage')}>
              Manage Users
>>>>>>> 3cd2829 (Revert "feat: implement telemetry visualization component and initialize interactive map module")
            </Button>
          </CardContent>
        </Card>

        {['super_admin', 'super admin', 'admin'].includes(role) && (
          <Card className="flex flex-col hover:shadow-md transition-all duration-300 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Team Management</CardTitle>
              <CardDescription className="text-gray-500 text-sm leading-relaxed">
                View and configure access for operators directly within your jurisdiction parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-2">
              <Button variant="outline" className="w-fit px-6" onClick={() => navigate('/manage')}>
                Manage Users
              </Button>
            </CardContent>
          </Card>
        )}
        <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200 p-6 flex flex-col items-start transition ease-in-out hover:shadow-md">
          <h2 className="text-lg font-medium text-gray-900">Data Analytics</h2>
          <p className="mt-1 text-sm text-gray-500 flex-1">
            Access the telemetry filters and review precise data sets across raw, aggregated, and delta modes.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/filters/raw')}>
            View Data
          </Button>
        </div>

        {['super_admin', 'super admin', 'admin'].includes(role) && (
          <Card className="flex flex-col hover:shadow-md transition-all duration-300 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Onboard Members</CardTitle>
              <CardDescription className="text-gray-500 text-sm leading-relaxed">
                Provision brand new administrative accounts directly under your supervision scope.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-2">
              <Button variant="outline" className="w-fit px-6" onClick={() => navigate('/register')}>
                Register New User
              </Button>
            </CardContent>
          </Card>
        )}

        {role === 'operator' && (
<<<<<<< HEAD
          <Card className="flex flex-col hover:shadow-md transition-all duration-300 border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">System Status</CardTitle>
              <CardDescription className="text-gray-500 text-sm leading-relaxed">
                Your station equipment is currently reporting correctly. All telemetry sockets are established.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-2">
              <Badge variant="outline" className="flex items-center gap-1.5 w-fit bg-green-50 text-green-700 border-green-200 px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Connection Stable
              </Badge>
            </CardContent>
          </Card>
<<<<<<< HEAD
=======
=======
>>>>>>> d01ad7c (feat: add role-based dashboard page with navigation and status monitoring)
          <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200 p-6 flex flex-col items-start transition ease-in-out hover:shadow-md">
            <h2 className="text-lg font-medium text-gray-900">System Status</h2>
            <p className="mt-1 text-sm text-gray-500 flex-1">
              Your station equipment is currently reporting correctly. All telemetry sockets are established.
            </p>
            <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
               Connection Stable
            </div>
          </div>
<<<<<<< HEAD
>>>>>>> 3cd2829 (Revert "feat: implement telemetry visualization component and initialize interactive map module")
=======
>>>>>>> d01ad7c (feat: add role-based dashboard page with navigation and status monitoring)
        )}
      </div>
    </div>
  );
};

export default Dashboard;
