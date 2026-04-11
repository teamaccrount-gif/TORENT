import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">
            {roleText} Dashboard
          </h1>
          <div className="mt-2 text-sm text-gray-500">
            <p>Welcome back, <span className="font-medium text-gray-900">{user.email}</span>.</p>
            <p className="mt-1">{primaryScopeText}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </Button>
          </div>
        )}

        {['super admin', 'admin'].includes(role) && (
          <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200 p-6 flex flex-col items-start transition ease-in-out hover:shadow-md">
            <h2 className="text-lg font-medium text-gray-900">Onboard Members</h2>
            <p className="mt-1 text-sm text-gray-500 flex-1">
              Provision brand new administrative accounts directly under your supervision scope.
            </p>
            <Button variant="secondary" className="mt-4" onClick={() => navigate('/register')}>
              Register New User
            </Button>
          </div>
        )}

        {role === 'operator' && (
          <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200 p-6 flex flex-col items-start transition ease-in-out hover:shadow-md">
            <h2 className="text-lg font-medium text-gray-900">System Status</h2>
            <p className="mt-1 text-sm text-gray-500 flex-1">
              Your station equipment is currently reporting correctly. All telemetry sockets are established.
            </p>
            <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
               Connection Stable
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
