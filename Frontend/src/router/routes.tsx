
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Shell } from '../components/layout/Shell';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import RegisterUser from '../pages/RegisterUser';
import ManageUsers from '../pages/ManageUsers';
import ManageUserDetail from '../pages/ManageUserDetail';
import MapPage from '../pages/Map';
import TableView from '../pages/tables/TableView';
import Raw from '../pages/filters/Raw';
import Aggregated from '../pages/filters/Aggregated';
import Delta from '../pages/filters/Delta';

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
          // Dashboard accessible by all authenticated users
          {
            path: 'dashboard',
            element: <ProtectedRoute action="canAccessDashboard" />,
            children: [{ index: true, element: <Dashboard /> }],
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
          {
            path: 'map',
            element: <ProtectedRoute action="canAccessDashboard" />,
            children: [{ index: true, element: <MapPage /> }],
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
