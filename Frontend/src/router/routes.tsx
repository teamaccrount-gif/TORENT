
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Shell } from '../components/layout/Shell';

import Login from '../pages/Login';
import DynamicTableView from '../components/dashboard/DynamicTableView';
import { DashboardRedirect } from '../components/dashboard/DashboardRedirect';
import RegisterUser from '../pages/RegisterUser';
import ManageUsers from '../pages/ManageUsers';
import ManageUserDetail from '../pages/ManageUserDetail';
import TableView from '../pages/tables/TableView';
import Raw from '../pages/filters/Raw';
import Aggregated from '../pages/filters/Aggregated';
import Delta from '../pages/filters/Delta';
import MapView from '../components/Map/MapView';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,   // Auth check mapping wrapper
    children: [
      {
        path: '/',
        element: <Shell />,        // Outer application shell for authenticated users
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <ProtectedRoute action="canAccessDashboard" />,
            children: [
              { index: true, element: <DashboardRedirect /> },
              { path: ':view', element: <DynamicTableView /> }
            ],
          },
          {
            path: 'map',
            element: <ProtectedRoute />, // Accessible to all authenticated users
            children: [{ index: true, element: <MapView /> }],
          },
          // Registration route requires canCreate elements
          {
            path: 'register',
            element: <ProtectedRoute action="canCreate" />,
            children: [{ index: true, element: <RegisterUser /> }],
          },
          // Manage route requires canManage elements
          {
            path: 'manage',
            element: <ProtectedRoute action="canManage" />,
            children: [
              { index: true, element: <ManageUsers /> },
              { path: ':userId', element: <ManageUserDetail /> },
            ],
          },
          // Dynamic Technical Tables
          {
            path: 'tables/:tableType',
            element: <ProtectedRoute action="allowedTables" />,
            children: [{ index: true, element: <TableView /> }],
          },
          // Filter routes accessible according to canAccessFilters
          {
            path: 'filters',
            element: <ProtectedRoute action="canAccessFilters" />,
            children: [
              { path: 'raw', element: <Raw /> },
              { path: 'aggregated', element: <Aggregated /> },
              { path: 'delta', element: <Delta /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
