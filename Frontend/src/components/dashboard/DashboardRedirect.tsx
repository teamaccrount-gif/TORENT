import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAllowedView } from '../../config/accessControl';
import { getEffectiveLevel } from '../../utils/registrationHelpers';

export const DashboardRedirect: React.FC = () => {
  const { user, role } = useAuth();
  
  if (!user || !role) {
    return null; // Let ProtectedRoute handle the auth failure
  }
  
  const effectiveLevel = getEffectiveLevel(user);
  const allowedView = getAllowedView(role, effectiveLevel);
  return <Navigate to={`/dashboard/${allowedView}`} replace />;
};
