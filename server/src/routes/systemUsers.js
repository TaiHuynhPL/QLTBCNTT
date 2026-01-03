import express from 'express';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';
import { Op } from 'sequelize';

const router = express.Router();
const { SystemUser, AssetHolder } = models;

// Get all system users (Admin only) with pagination and search
router.get('/',
  authenticateToken,
  authorize('Admin'),
  async (req, res) => {
    try {
      const { search = '', status = '', page = 1, limit = 10 } = req.query;
      
      const where = {};
      
      // Filter by status (active/inactive)
      if (status === 'active') {
        where.is_active = true;
      } else if (status === 'inactive') {
        where.is_active = false;
      }
      
      // Search filter
      let include = [{
        model: AssetHolder,
        as: 'assetHolder',
        attributes: ['full_name', 'email', 'department', 'employee_code'],
        where: search ? { full_name: { [Op.iLike]: `%${search}%` } } : undefined,
        required: false
      }];
      
      // If search is provided, also search in username
      if (search) {
        where[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      const offset = (page - 1) * limit;
      
      const { count, rows } = await SystemUser.findAndCountAll({
        where,
        attributes: { exclude: ['password_hash'] },
        include,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });

      res.json({ 
        success: true, 
        data: {
          users: rows,
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// Get single system user (Admin only)
router.get('/:id',
  authenticateToken,
  authorize('Admin'),
  async (req, res) => {
    try {
      const user = await SystemUser.findByPk(req.params.id, {
        attributes: { exclude: ['password_hash'] },
        include: [{
          model: AssetHolder,
          as: 'assetHolder',
          attributes: ['asset_holder_id', 'full_name', 'email', 'department', 'employee_code']
        }]
      });

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Get user detail error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// Create user account (Admin only)
router.post('/',
  authenticateToken,
  authorize('Admin'),
  logActivity('CREATE', 'system_users'),
  async (req, res) => {
    try {
      const { username, password, user_role, asset_holder_id } = req.body;
      
      // Support both 'user_role' and 'role' parameter names
      const role = user_role || req.body.role;
      
      if (!username || !password || !role) {
        return res.status(400).json({ success: false, error: 'Username, password, and user_role are required' });
      }

      // Check if username already exists
      const existingUser = await SystemUser.findOne({ where: { username } });
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Username already exists' });
      }

      // Optionally check asset_holder_id exists if provided
      let assetHolder = null;
      if (asset_holder_id) {
        assetHolder = await AssetHolder.findByPk(asset_holder_id);
        if (!assetHolder) {
          return res.status(400).json({ success: false, error: 'Invalid asset_holder_id' });
        }
      }

      // Create user
      const newUser = await SystemUser.create({
        username,
        password_hash: password,
        user_role: role,
        asset_holder_id: asset_holder_id || null,
        is_active: true
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          system_user_id: newUser.system_user_id,
          username: newUser.username,
          user_role: newUser.user_role,
          asset_holder_id: newUser.asset_holder_id
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// Update user (Admin only)
router.put('/:id',
  authenticateToken,
  authorize('Admin'),
  logActivity('UPDATE', 'system_users'),
  async (req, res) => {
    try {
      const { user_role, is_active } = req.body;
      const user = await SystemUser.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      await user.update({
        user_role: user_role || user.user_role,
        is_active: is_active !== undefined ? is_active : user.is_active
      });

      const updatedUser = await SystemUser.findByPk(user.system_user_id, {
        attributes: { exclude: ['password_hash'] },
        include: [{
          model: AssetHolder,
          as: 'assetHolder',
          attributes: ['full_name', 'email', 'department']
        }]
      });

      res.json({ success: true, data: updatedUser });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// Delete user (Admin only)
router.delete('/:id',
  authenticateToken,
  authorize('Admin'),
  logActivity('DELETE', 'system_users'),
  async (req, res) => {
    try {
      const user = await SystemUser.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      await user.destroy();

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

export default router;
