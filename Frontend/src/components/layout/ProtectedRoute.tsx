import React from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PERMISSIONS, TABLE_LEVELS } from '../../config/permissions';
import { canViewTableAtLevel, getEffectiveLevel } from '../../utils/registrationHelpers';
import type { Role } from '../../types';

export const ProtectedRoute: React.FC<{ action?: keyof typeof PERMISSIONS[Role] | 'allowedTables' }> = ({ action }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { tableType } = useParams<{ tableType: string }>();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user.role.toLowerCase() as Role;
  const level = getEffectiveLevel(user);
  const permissions = PERMISSIONS[role];

  if (!permissions) {
    console.warn('[PROTECTED_ROUTE] Unknown or unsupported role:', role);
    return <Navigate to="/login" replace />;
  }

  if (action) {
    if (action === 'allowedTables') {
      const slug = tableType?.toLowerCase() || '';
      if (!slug) return <Outlet />;
      
      const tableLevel = TABLE_LEVELS[slug];
      if (!tableLevel) return <Navigate to="/dashboard" replace />;

      if (!canViewTableAtLevel(level, tableLevel)) {
        console.warn(`[PROTECTED_ROUTE] Access denied to table ${slug} for level ${level}`);
        return <Navigate to="/dashboard" replace />;
      }
    } else {
      const hasPermission = (permissions as any)[action];
      
      let isAllowed = false;
      if (typeof hasPermission === 'boolean') {
        isAllowed = hasPermission;
      }

      if (!isAllowed) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <Outlet />;
};
