import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../config/permissions';
import type { Role } from '../../types';

export const ProtectedRoute: React.FC<{ action?: keyof typeof PERMISSIONS[Role] }> = ({ action }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (action && role) {
    const hasPermission = PERMISSIONS[role][action];
    
    let isAllowed = false;
    if (typeof hasPermission === 'boolean') {
      isAllowed = hasPermission;
    } else if (Array.isArray(hasPermission)) {
      isAllowed = hasPermission.length > 0;
    }

    if (!isAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};
