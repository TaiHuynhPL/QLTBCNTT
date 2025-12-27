import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();
const { ActivityLog, SystemUser } = models;

// Get activity logs with filters
router.get('/', authenticateToken, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const {
      user_id,
      action_type,
      target_table,
      start_date,
      end_date,
      page = 1,
      limit = 50
    } = req.query;

    const where = {};
    
    if (user_id) where.user_id = user_id;
    if (action_type) where.action_type = action_type;
    if (target_table) where.target_table = target_table;
    
    if (start_date || end_date) {
      where.action_timestamp = {};
      if (start_date) where.action_timestamp[Op.gte] = new Date(start_date);
      if (end_date) where.action_timestamp[Op.lte] = new Date(end_date);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      include: [
        { model: SystemUser, as: 'user', attributes: ['username'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['action_timestamp', 'DESC']]
    });

    res.json({
      activityLogs: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;