import React from 'react';
import type { Role } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Helper component specifically for Role
export const RoleBadge: React.FC<{ role: Role | { name: string } }> = ({ role }) => {
  const roleFormat = {
    'SUPER_ADMIN': { label: 'Super Admin', variant: 'danger' as const },
    'ADMIN': { label: 'Admin', variant: 'danger' as const },
    'MANAGER': { label: 'Manager', variant: 'primary' as const },
    'ENGINEER': { label: 'Engineer', variant: 'warning' as const },
    'OPERATOR': { label: 'Operator', variant: 'success' as const },
  };

  const roleName = typeof role === 'object' && role !== null ? role.name : role;
  const normalizedRole = String(roleName || '').toUpperCase().replace(/ /g, '_');
  
  const fallback = {
    label: roleName ? String(roleName).replace(/[_-]/g, ' ') : 'Unknown Role',
    variant: 'default' as const,
  };
  const { label, variant } = roleFormat[normalizedRole as keyof typeof roleFormat] ?? fallback;
  return <Badge variant={variant}>{label}</Badge>;
};

// Helper component specifically for Status (Active/Inactive)
export const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return isActive ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="default">Inactive</Badge>
  );
};
