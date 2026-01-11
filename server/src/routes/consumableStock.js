import express from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();
const { ConsumableStock, ConsumableModel, Location, ConsumableCheckout } = models;

// Get low stock alert (đặt trước để tránh conflict với /:id)
router.get('/alert/low-stock', authenticateToken, async (req, res) => {
  try {
    const lowStocks = await ConsumableStock.findAll({
      where: sequelize.where(
        sequelize.col('quantity'),
        Op.lte,
        sequelize.col('min_quantity')
      ),
      include: [
        {
          model: ConsumableModel,
          as: 'consumableModel',
          attributes: ['consumable_model_id', 'consumable_model_name']
        },
        {
          model: Location,
          as: 'location',
          attributes: ['location_id', 'location_name']
        }
      ],
      raw: false
    });

    res.json({
      success: true,
      data: {
        alerts: lowStocks,
        total: lowStocks.length
      }
    });
  } catch (error) {
    console.error('Get low stock alert error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get all consumable stock with related data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, page = 1, limit = 10, location_id } = req.query;

    const where = {};
    if (location_id) {
      where.location_id = location_id;
    }

    if (search) {
      where[Op.or] = [
        { '$consumableModel.consumable_model_name$': { [Op.iLike]: `%${search}%` } },
        { '$consumableModel.manufacturer$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await ConsumableStock.findAndCountAll({
      where,
      include: [
        {
          model: ConsumableModel,
          as: 'consumableModel',
          attributes: ['consumable_model_id', 'consumable_model_name', 'manufacturer'],
          required: false
        },
        {
          model: Location,
          as: 'location',
          attributes: ['location_id', 'location_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      raw: false,
      subQuery: false
    });

    res.json({
      success: true,
      data: {
        stocks: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get consumable stock error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single stock by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const stock = await ConsumableStock.findByPk(req.params.id, {
      include: [
        {
          model: ConsumableModel,
          as: 'consumableModel',
          attributes: ['consumable_model_id', 'consumable_model_name', 'manufacturer'],
          required: false
        },
        {
          model: Location,
          as: 'location',
          attributes: ['location_id', 'location_name'],
          required: false
        }
      ],
      raw: false
    });

    if (!stock) {
      return res.status(404).json({ success: false, error: 'Stock not found' });
    }

    res.json({ success: true, data: stock });
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create or update stock (Nhập kho)
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager', 'Warehouse'),
  logActivity('CREATE', 'consumable_stock'),
  async (req, res) => {
    try {
      const { consumable_model_id, location_id, quantity, min_quantity } = req.body;

      if (!consumable_model_id || !location_id || quantity === undefined) {
        return res.status(400).json({ 
          success: false, 
          error: 'Thiếu thông tin bắt buộc: consumable_model_id, location_id, quantity' 
        });
      }

      // Check if stock already exists
      let stock = await ConsumableStock.findOne({
        where: { consumable_model_id, location_id }
      });

      if (stock) {
        // Update quantity
        stock.quantity += parseInt(quantity);
        if (min_quantity !== undefined) {
          stock.min_quantity = parseInt(min_quantity);
        }
        await stock.save();

        return res.json({
          success: true,
          message: 'Cập nhật tồn kho thành công',
          data: stock
        });
      }

      // Create new stock
      const newStock = await ConsumableStock.create({
        consumable_model_id: parseInt(consumable_model_id),
        location_id: parseInt(location_id),
        quantity: parseInt(quantity),
        min_quantity: parseInt(min_quantity || 0)
      });

      res.status(201).json({
        success: true,
        message: 'Tạo tồn kho thành công',
        data: newStock
      });
    } catch (error) {
      console.error('Create/update stock error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Update stock quantity
router.put('/:id',
  authenticateToken,
  authorize('Admin', 'Manager', 'Warehouse'),
  logActivity('UPDATE', 'consumable_stock'),
  async (req, res) => {
    try {
      const { quantity, min_quantity } = req.body;
      const stock = await ConsumableStock.findByPk(req.params.id);

      if (!stock) {
        return res.status(404).json({ success: false, error: 'Stock not found' });
      }

      if (quantity !== undefined) {
        stock.quantity = parseInt(quantity);
      }
      if (min_quantity !== undefined) {
        stock.min_quantity = parseInt(min_quantity);
      }

      await stock.save();

      res.json({
        success: true,
        message: 'Cập nhật tồn kho thành công',
        data: stock
      });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
