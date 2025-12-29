import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();
const { ConsumableStock, ConsumableCheckout, ConsumableModel, Location, AssetHolder } = models;

// Get consumable stock
router.get('/stock', authenticateToken, async (req, res) => {
  try {
    const { location_id, low_stock_only } = req.query;

    const where = {};
    if (location_id) where.location_id = location_id;

    const stocks = await ConsumableStock.findAll({
      where,
      include: [
        { model: ConsumableModel, as: 'consumableModel' },
        { model: Location, as: 'location' }
      ]
    });

    let result = stocks;
    if (low_stock_only === 'true') {
      result = stocks.filter(stock => stock.quantity < stock.min_quantity);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get consumable stock error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get low stock alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const lowStockItems = await ConsumableStock.findAll({
      where: {
        quantity: {
          [Op.lt]: models.sequelize.col('min_quantity')
        }
      },
      include: [
        { model: ConsumableModel, as: 'consumableModel' },
        { model: Location, as: 'location' }
      ]
    });

    res.json({ success: true, data: lowStockItems });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Checkout consumable
router.post('/checkout',
  authenticateToken,
  authorize('Admin', 'Manager', 'Staff'),
  logActivity('CREATE', 'consumable_checkouts'),
  async (req, res) => {
    try {
      const {
        checkout_date,
        asset_holder_id,
        quantity_checked_out,
        consumable_model_id,
        location_id
      } = req.body;

      // Validate required fields
      if (!checkout_date || !asset_holder_id || !quantity_checked_out || !consumable_model_id || !location_id) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Find stock
      const stock = await ConsumableStock.findOne({
        where: { consumable_model_id, location_id }
      });

      if (!stock) {
        return res.status(404).json({ success: false, error: 'Stock not found for this consumable at this location' });
      }

      // Check if sufficient stock
      if (stock.quantity < quantity_checked_out) {
        return res.status(400).json({ success: false, error: 'Insufficient stock' });
      }

      // Create checkout record
      const checkout = await ConsumableCheckout.create({
        checkout_date,
        asset_holder_id,
        quantity_checked_out,
        consumable_model_id
      });

      // Update stock quantity
      await stock.update({ quantity: stock.quantity - quantity_checked_out });

      const createdCheckout = await ConsumableCheckout.findByPk(checkout.checkout_id, {
        include: [
          { model: AssetHolder, as: 'assetHolder' },
          { model: ConsumableModel, as: 'consumableModel' }
        ]
      });

      res.status(201).json({ success: true, data: createdCheckout });
    } catch (error) {
      console.error('Checkout consumable error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// Get checkout history
router.get('/checkouts', authenticateToken, async (req, res) => {
  try {
    const { asset_holder_id, consumable_model_id } = req.query;

    const where = {};
    if (asset_holder_id) where.asset_holder_id = asset_holder_id;
    if (consumable_model_id) where.consumable_model_id = consumable_model_id;

    const checkouts = await ConsumableCheckout.findAll({
      where,
      include: [
        { model: AssetHolder, as: 'assetHolder' },
        { model: ConsumableModel, as: 'consumableModel' }
      ],
      order: [['checkout_date', 'DESC']]
    });

    res.json({ success: true, data: checkouts });
  } catch (error) {
    console.error('Get checkouts error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Adjust stock quantity
router.put('/stock/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('UPDATE', 'consumable_stocks'),
  async (req, res) => {
    try {
      const { quantity, min_quantity } = req.body;

      const stock = await ConsumableStock.findByPk(req.params.id);
      
      if (!stock) {
        return res.status(404).json({ success: false, error: 'Stock not found' });
      }

      await stock.update({
        quantity: quantity !== undefined ? quantity : stock.quantity,
        min_quantity: min_quantity !== undefined ? min_quantity : stock.min_quantity
      });

      const updatedStock = await ConsumableStock.findByPk(stock.stock_id, {
        include: [
          { model: ConsumableModel, as: 'consumableModel' },
          { model: Location, as: 'location' }
        ]
      });

      res.json({ success: true, data: updatedStock });
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

export default router;