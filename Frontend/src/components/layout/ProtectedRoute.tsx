import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS } from '../../config/permissions';
import type { Role } from '../../types';

export const ProtectedRoute: React.FC<{ action?: keyof typeof PERMISSIONS[Role] }> = ({ action }) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const normalizedRole = role ? (role.toUpperCase() as Role) : null;
  const permissions = normalizedRole ? PERMISSIONS[normalizedRole] : undefined;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!permissions) {
    console.warn('[PROTECTED_ROUTE] Unknown or unsupported role:', role);
    return <Navigate to="/login" replace />;
  }

  if (action) {
    const hasPermission = permissions[action];
    
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
