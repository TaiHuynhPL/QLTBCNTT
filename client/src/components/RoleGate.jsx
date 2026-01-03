import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * RoleGate - Conditionally render content based on user role
 * 
 * Usage:
 * <RoleGate roles={['Admin', 'Manager']}>
 *   <button>Edit</button>
 * </RoleGate>
 */
export function RoleGate({ roles, children, fallback = null }) {
  const { hasRole } = useAuth();

  if (!hasRole(roles)) {
    return fallback;
  }

  return children;
}

/**
 * PermissionGate - Conditionally render content based on specific action permission
 * 
 * Usage:
 * <PermissionGate action="deleteAsset">
 *   <button>Delete</button>
 * </PermissionGate>
 */
export function PermissionGate({ action, children, fallback = null }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(action)) {
    return fallback;
  }

  return children;
}

/**
 * AdminOnly - Only render for Admin users
 */
export function AdminOnly({ children, fallback = null }) {
  return <RoleGate roles="Admin" fallback={fallback}>{children}</RoleGate>;
}

/**
 * ManagerOnly - Only render for Manager users
 */
export function ManagerOnly({ children, fallback = null }) {
  return <RoleGate roles="Manager" fallback={fallback}>{children}</RoleGate>;
}

/**
 * StaffOnly - Only render for Staff users
 */
export function StaffOnly({ children, fallback = null }) {
  return <RoleGate roles="Staff" fallback={fallback}>{children}</RoleGate>;
}

/**
 * AdminOrManager - Only render for Admin or Manager users
 */
export function AdminOrManager({ children, fallback = null }) {
  return <RoleGate roles={['Admin', 'Manager']} fallback={fallback}>{children}</RoleGate>;
}
