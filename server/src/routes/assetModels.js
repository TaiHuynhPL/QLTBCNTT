import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const { AssetModel } = models;

// Get all asset models
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { model_name: { [Op.iLike]: `%${search}%` } },
        { manufacturer: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await AssetModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        assetModels: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get asset models error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single asset model by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const model = await AssetModel.findByPk(req.params.id);

    if (!model) {
      return res.status(404).json({ success: false, error: 'Asset model not found' });
    }

    res.json({ success: true, data: model });
  } catch (error) {
    console.error('Get asset model error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
