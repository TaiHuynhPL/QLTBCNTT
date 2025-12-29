
import express from 'express';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();
const { AssetHolder } = models;

// GET /holders?search=...&page=1&limit=10
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
    // Get paginated rows
    const rows = await AssetHolder.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['full_name', 'ASC']]
    });
    res.json({ success: true, data: { holders: rows, total, page: parseInt(page), totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('Get holders error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


// GET /holders/:id - Lấy chi tiết AssetHolder
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const holder = await AssetHolder.findByPk(req.params.id);
    if (!holder) {
      return res.status(404).json({ success: false, error: 'Asset holder not found' });
    }
    res.json({ success: true, data: holder });
  } catch (error) {
    console.error('Get holder detail error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});



export default router;
