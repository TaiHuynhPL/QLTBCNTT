import express from 'express';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();
const { ConsumableCheckout, ConsumableStock, ConsumableModel, AssetHolder } = models;

// Get all checkouts with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, page = 1, limit = 10, asset_holder_id, consumable_model_id } = req.query;

    const where = {};
    if (asset_holder_id) {
      where.asset_holder_id = parseInt(asset_holder_id);
    }
    if (consumable_model_id) {
      where.consumable_model_id = parseInt(consumable_model_id);
    }

    const { count, rows } = await ConsumableCheckout.findAndCountAll({
      where,
      include: [
        {
          model: ConsumableModel,
          as: 'consumableModel',
          attributes: ['consumable_model_id', 'consumable_model_name']
        },
        {
          model: AssetHolder,
          as: 'assetHolder',
          attributes: ['asset_holder_id', 'full_name']
        }
      ],
      order: [['checkout_date', 'DESC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        checkouts: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get checkouts error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create checkout (Xuất kho cho người dùng)
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager', 'Warehouse'),
  logActivity('CREATE', 'consumable_checkouts'),
  async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { consumable_model_id, asset_holder_id, quantity_checked_out, location_id, checkout_date } = req.body;

      // Validation
      if (!consumable_model_id || !asset_holder_id || !quantity_checked_out || !location_id) {
        return res.status(400).json({
          success: false,
          error: 'Thiếu thông tin bắt buộc'
        });
      }

      const qty = parseInt(quantity_checked_out);

      if (qty <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Số lượng xuất phải lớn hơn 0'
        });
      }

      // Check stock availability
      const stock = await ConsumableStock.findOne({
        where: {
          consumable_model_id: parseInt(consumable_model_id),
          location_id: parseInt(location_id)
        },
        transaction
      });

      if (!stock) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          error: 'Không tìm thấy tồn kho cho loại vật tư này tại vị trí đã chọn'
        });
      }

      if (stock.quantity < qty) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          error: `Số lượng tồn kho không đủ. Hiện có: ${stock.quantity}, yêu cầu: ${qty}`
        });
      }

      // Create checkout record
      const checkout = await ConsumableCheckout.create({
        consumable_model_id: parseInt(consumable_model_id),
        asset_holder_id: parseInt(asset_holder_id),
        quantity_checked_out: qty,
        checkout_date: checkout_date || new Date().toISOString().split('T')[0]
      }, { transaction });

      // Update stock (Trừ đi số lượng)
      stock.quantity -= qty;
      await stock.save({ transaction });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Xuất kho thành công',
        data: {
          checkout,
          updatedStock: stock
        }
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Create checkout error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

// Get checkout by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const checkout = await ConsumableCheckout.findByPk(req.params.id, {
      include: [
        {
          model: ConsumableModel,
          as: 'consumableModel',
          attributes: ['consumable_model_id', 'consumable_model_name']
        },
        {
          model: AssetHolder,
          as: 'assetHolder',
          attributes: ['asset_holder_id', 'full_name']
        }
      ]
    });

    if (!checkout) {
      return res.status(404).json({ success: false, error: 'Checkout not found' });
    }

    res.json({ success: true, data: checkout });
  } catch (error) {
    console.error('Get checkout error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
