import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const { Supplier } = models;

// Get all suppliers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, page = 1, limit = 100 } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { supplier_name: { [Op.iLike]: `%${search}%` } },
        { contact_info: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['supplier_name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        suppliers: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single supplier by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({ success: false, error: 'Supplier not found' });
    }

    res.json({ success: true, data: supplier });
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
