import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles: ('admin' | 'moderator' | 'agent' | 'encoder')[];
  fallback?: ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Permission utility functions
export const usePermissions = () => {
  const { user } = useAuth();

  const canCreateUsers = () => {
    return user?.role === 'moderator';
  };

  const canUpdateApplications = () => {
    return user?.role === 'admin' || user?.role === 'moderator';
  };

  const canDeleteApplications = () => {
    return user?.role === 'admin' || user?.role === 'moderator';
  };

  const canViewApplications = () => {
    return user?.role === 'admin' || user?.role === 'moderator' || user?.role === 'agent' || user?.role === 'encoder';
  };

  const canEditApplications = () => {
    return user?.role === 'admin' || user?.role === 'moderator';
  };

  const canManageUsers = () => {
    return user?.role === 'admin' || user?.role === 'moderator';
  };

  const canDeleteUsers = () => {
    return user?.role === 'admin';
  };

  return {
    canCreateUsers,
    canUpdateApplications,
    canDeleteApplications,
    canViewApplications,
    canEditApplications,
    canManageUsers,
    canDeleteUsers,
  };
}; 