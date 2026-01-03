import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

/**
 * AuthProvider component - provides user authentication info and role throughout the app
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
          setError(null);
        }
      } catch (err) {
        setUser(null);
        setError(err.response?.data?.error || 'Failed to fetch user info');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  /**
   * Check if user has a specific role
   */
  const hasRole = (role) => {
    if (!user) return false;
    if (typeof role === 'string') {
      return user.user_role === role;
    }
    if (Array.isArray(role)) {
      return role.includes(user.user_role);
    }
    return false;
  };

  /**
   * Check if user has permission for a specific action
   */
  const hasPermission = (action) => {
    if (!user) return false;

    const permissions = {
      // System Users Management (only Admin)
      manageSystemUsers: user.user_role === 'Admin',
      createUser: user.user_role === 'Admin',
      updateUser: user.user_role === 'Admin',
      deleteUser: user.user_role === 'Admin',

      // Purchase Orders
      // Staff: create, submit (send to approval), and stock in
      // Admin & Manager: all permissions
      createPO: ['Admin', 'Manager', 'Staff'].includes(user.user_role),
      submitPO: ['Admin', 'Manager', 'Staff'].includes(user.user_role), // Send for approval
      approvePO: ['Admin', 'Manager'].includes(user.user_role), // Approve PO
      rejectPO: ['Admin', 'Manager'].includes(user.user_role), // Reject PO
      stockInPO: ['Admin', 'Manager', 'Staff'].includes(user.user_role), // Complete/Stock in PO
      updatePO: ['Admin', 'Manager'].includes(user.user_role), // Edit PO details
      deletePO: ['Admin', 'Manager'].includes(user.user_role), // Delete PO

      // Assets (Admin and Manager)
      createAsset: ['Admin', 'Manager'].includes(user.user_role),
      updateAsset: ['Admin', 'Manager'].includes(user.user_role),
      deleteAsset: ['Admin', 'Manager'].includes(user.user_role),
      viewAsset: ['Admin', 'Manager', 'Staff'].includes(user.user_role),

      // AssetHolders (only Admin and Manager can create/update/delete)
      createHolder: ['Admin', 'Manager'].includes(user.user_role),
      updateHolder: ['Admin', 'Manager'].includes(user.user_role),
      deleteHolder: ['Admin', 'Manager'].includes(user.user_role),
      viewHolder: ['Admin', 'Manager', 'Staff'].includes(user.user_role),

      // Assignments
      createAssignment: ['Admin', 'Manager'].includes(user.user_role),
      updateAssignment: ['Admin', 'Manager'].includes(user.user_role),
      deleteAssignment: ['Admin', 'Manager'].includes(user.user_role),
      viewAssignment: ['Admin', 'Manager', 'Staff'].includes(user.user_role),

      // Consumables
      createConsumable: ['Admin', 'Manager'].includes(user.user_role),
      updateConsumable: ['Admin', 'Manager'].includes(user.user_role),
      deleteConsumable: ['Admin', 'Manager'].includes(user.user_role),
      viewConsumable: ['Admin', 'Manager', 'Staff'].includes(user.user_role),

      // Maintenance
      createMaintenance: ['Admin', 'Manager'].includes(user.user_role),
      updateMaintenance: ['Admin', 'Manager'].includes(user.user_role),
      deleteMaintenance: ['Admin', 'Manager'].includes(user.user_role),
      viewMaintenance: ['Admin', 'Manager', 'Staff'].includes(user.user_role),
    };

    return permissions[action] || false;
  };

  const value = {
    user,
    loading,
    error,
    hasRole,
    hasPermission,
    isAdmin: user?.user_role === 'Admin',
    isManager: user?.user_role === 'Manager',
    isStaff: user?.user_role === 'Staff'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
