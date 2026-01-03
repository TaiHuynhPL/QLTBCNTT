import jwt from 'jsonwebtoken';
import models from '../models/index.js';

const { SystemUser } = models;

export const authenticateToken = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await SystemUser.findByPk(decoded.system_user_id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Role-based authorization middleware
 * Supports multiple authorization strategies
 * 
 * Usage:
 * - authorize('Admin', 'Manager') - Allow specific roles
 * - authorize({ action: 'manageSysUsers', roles: ['Admin'] }) - Role-based with action
 */
export const authorize = (...args) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Handle different argument patterns
    if (args.length === 0 || (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0]))) {
      // Dynamic role checking based on action
      const config = args[0] || {};
      if (!checkPermission(req.user.user_role, config)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    } else {
      // Simple role checking
      const roles = args.flat();
      if (!roles.includes(req.user.user_role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    next();
  };
};

/**
 * Check if user has permission based on role and action
 */
export const checkPermission = (userRole, config = {}) => {
  const { action, requiredRoles } = config;
  
  // Role hierarchy
  const roleHierarchy = {
    'Admin': 3,
    'Manager': 2,
    'Staff': 1
  };

  const userLevel = roleHierarchy[userRole] || 0;

  // If requiredRoles specified, check if user is in allowed roles
  if (requiredRoles && Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }

  // Define permissions by role for specific actions
  const permissions = {
    // System Users Management (only Admin)
    'manageSystemUsers': (role) => role === 'Admin',
    'createUser': (role) => role === 'Admin',
    'updateUser': (role) => role === 'Admin',
    'deleteUser': (role) => role === 'Admin',
    
    // Purchase Orders
    // Staff: create, submit (send to approval), and stock in
    // Admin & Manager: all permissions
    'createPO': (role) => ['Admin', 'Manager', 'Staff'].includes(role),
    'submitPO': (role) => ['Admin', 'Manager', 'Staff'].includes(role),
    'approvePO': (role) => ['Admin', 'Manager'].includes(role),
    'rejectPO': (role) => ['Admin', 'Manager'].includes(role),
    'stockInPO': (role) => ['Admin', 'Manager', 'Staff'].includes(role),
    'updatePO': (role) => ['Admin', 'Manager'].includes(role),
    'deletePO': (role) => ['Admin', 'Manager'].includes(role),
    
    // Assets (Admin and Manager)
    'createAsset': (role) => ['Admin', 'Manager'].includes(role),
    'updateAsset': (role) => ['Admin', 'Manager'].includes(role),
    'deleteAsset': (role) => ['Admin', 'Manager'].includes(role),
    'viewAsset': (role) => ['Admin', 'Manager', 'Staff'].includes(role),
    
    // AssetHolders (only Admin and Manager)
    'createHolder': (role) => ['Admin', 'Manager'].includes(role),
    'updateHolder': (role) => ['Admin', 'Manager'].includes(role),
    'deleteHolder': (role) => ['Admin', 'Manager'].includes(role),
    'viewHolder': (role) => ['Admin', 'Manager', 'Staff'].includes(role),
    
    // Assignments
    'createAssignment': (role) => ['Admin', 'Manager'].includes(role),
    'updateAssignment': (role) => ['Admin', 'Manager'].includes(role),
    'deleteAssignment': (role) => ['Admin', 'Manager'].includes(role),
    'viewAssignment': (role) => ['Admin', 'Manager', 'Staff'].includes(role),
    
    // Consumables
    'createConsumable': (role) => ['Admin', 'Manager'].includes(role),
    'updateConsumable': (role) => ['Admin', 'Manager'].includes(role),
    'deleteConsumable': (role) => ['Admin', 'Manager'].includes(role),
    'viewConsumable': (role) => ['Admin', 'Manager', 'Staff'].includes(role),
    
    // Maintenance
    'createMaintenance': (role) => ['Admin', 'Manager'].includes(role),
    'updateMaintenance': (role) => ['Admin', 'Manager'].includes(role),
    'deleteMaintenance': (role) => ['Admin', 'Manager'].includes(role),
    'viewMaintenance': (role) => ['Admin', 'Manager', 'Staff'].includes(role),
  };

  if (action && permissions[action]) {
    return permissions[action](userRole);
  }

  // Default: allow if user is authenticated
  return true;
};