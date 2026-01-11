
import express from 'express';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { Op } from 'sequelize';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();
const { AssetHolder, SystemUser } = models;

// GET /holders?search=...&page=1&limit=10 - All authenticated users can view
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const where = {};
    if (search) {
      where.full_name = { [Op.iLike]: `%${search}%` };
    }
    const offset = (page - 1) * limit;
    // Get total count with same where, but without limit/offset
    const total = await AssetHolder.count({ where });
    // Get paginated rows with system_user info
    const rows = await AssetHolder.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['full_name', 'ASC']],
      include: [
        {
          model: SystemUser,
          as: 'systemUser', // Đúng với association trong model/index.js
          attributes: { exclude: ['password_hash'] }
        }
      ]
    });
    res.json({ success: true, data: { holders: rows, total, page: parseInt(page), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get holders error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// GET /holders/:id - Lấy chi tiết AssetHolder - All authenticated users can view
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const holder = await AssetHolder.findByPk(req.params.id, {
      include: [{
        model: SystemUser,
        as: 'systemUser',
        attributes: { exclude: ['password_hash'] }
      }]
    });
    if (!holder) {
      return res.status(404).json({ success: false, error: 'Asset holder not found' });
    }
    res.json({ success: true, data: holder });
  } catch (error) {
    console.error('Get holder detail error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /holders - Create new asset holder (Admin and Manager only)
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('CREATE', 'asset_holders'),
  async (req, res) => {
    try {
      const { full_name, email, phone, department, job_title, location } = req.body;
      
      if (!full_name) {
        return res.status(400).json({ success: false, error: 'Full name is required' });
      }

      const newHolder = await AssetHolder.create({
        full_name,
        email: email || null,
        phone: phone || null,
        department: department || null,
        job_title: job_title || null,
        location: location || null
      });

      res.status(201).json({ success: true, message: 'Asset holder created successfully', data: newHolder });
    } catch (error) {
      console.error('Create holder error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// PUT /holders/:id - Update asset holder (Admin and Manager only)
router.put('/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('UPDATE', 'asset_holders'),
  async (req, res) => {
    try {
      const { full_name, email, phone, department, job_title, location } = req.body;
      const holder = await AssetHolder.findByPk(req.params.id);

      if (!holder) {
        return res.status(404).json({ success: false, error: 'Asset holder not found' });
      }

      await holder.update({
        full_name: full_name || holder.full_name,
        email: email !== undefined ? email : holder.email,
        phone: phone !== undefined ? phone : holder.phone,
        department: department !== undefined ? department : holder.department,
        job_title: job_title !== undefined ? job_title : holder.job_title,
        location: location !== undefined ? location : holder.location
      });

      res.json({ success: true, message: 'Asset holder updated successfully', data: holder });
    } catch (error) {
      console.error('Update holder error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// DELETE /holders/:id - Delete asset holder (Admin and Manager only)
router.delete('/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('DELETE', 'asset_holders'),
  async (req, res) => {
    try {
      const holder = await AssetHolder.findByPk(req.params.id);

      if (!holder) {
        return res.status(404).json({ success: false, error: 'Asset holder not found' });
      }

      await holder.destroy();
      res.json({ success: true, message: 'Asset holder deleted successfully' });
    } catch (error) {
      console.error('Delete holder error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

export default router;
