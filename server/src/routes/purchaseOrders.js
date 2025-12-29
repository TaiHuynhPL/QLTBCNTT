import express from 'express';
import models from '../models/index.js';
import { Op } from 'sequelize';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();
const { PurchaseOrder, DetailOrder, Supplier, SystemUser, AssetModel, ConsumableModel } = models;

// Get all purchase orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.order_code = { [Op.iLike]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    // Đếm tổng số record KHÔNG include (chỉ tính theo where)
    const count = await PurchaseOrder.count({ where });
    // Lấy dữ liệu trang hiện tại (có include)
    const rows = await PurchaseOrder.findAll({
      where,
      include: [
        { model: Supplier, as: 'supplier' },
        { model: SystemUser, as: 'createdBy', attributes: ['username'] },
        {
          model: DetailOrder,
          as: 'detailOrders',
          include: [
            { model: AssetModel, as: 'assetModel' },
            { model: ConsumableModel, as: 'consumableModel' }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['order_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        purchaseOrders: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single purchase order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: SystemUser, as: 'createdBy', attributes: ['username'] },
        {
          model: DetailOrder,
          as: 'detailOrders',
          include: [
            { model: AssetModel, as: 'assetModel' },
            { model: ConsumableModel, as: 'consumableModel' }
          ]
        }
      ]
    });

    if (!purchaseOrder) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }

    res.json({ success: true, data: purchaseOrder });
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create purchase order
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager', 'Staff'),
  logActivity('CREATE', 'purchase_orders'),
  async (req, res) => {
    try {
      const {
        order_code,
        order_date,
        supplier_id,
        status,
        notes,
        detail_orders
      } = req.body;

      // Validate required fields
      if (!order_code || !order_date || !supplier_id || !status) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Check for duplicate order_code
      const existingOrder = await PurchaseOrder.findOne({ where: { order_code } });
      if (existingOrder) {
        return res.status(400).json({ success: false, error: 'Order code already exists' });
      }

      // Calculate total amount
      let total_amount = 0;
      if (detail_orders && detail_orders.length > 0) {
        total_amount = detail_orders.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0);
      }

      const purchaseOrder = await PurchaseOrder.create({
        order_code,
        order_date,
        supplier_id,
        created_by_user_id: req.user.system_user_id,
        status,
        notes,
        total_amount
      });

      // Create detail orders if provided
      if (detail_orders && detail_orders.length > 0) {
        for (const detail of detail_orders) {
          // Validate polymorphic constraint
          if ((detail.asset_model_id && detail.consumable_model_id) || 
              (!detail.asset_model_id && !detail.consumable_model_id)) {
            throw new Error('Each detail order must have either asset_model_id OR consumable_model_id');
          }

          await DetailOrder.create({
            purchase_order_id: purchaseOrder.purchase_order_id,
            asset_model_id: detail.asset_model_id || null,
            consumable_model_id: detail.consumable_model_id || null,
            quantity: detail.quantity,
            unit_price: detail.unit_price,
            total_price: detail.total_price
          });
        }
      }

      const createdOrder = await PurchaseOrder.findByPk(purchaseOrder.purchase_order_id, {
        include: [
          { model: Supplier, as: 'supplier' },
          { model: SystemUser, as: 'createdBy', attributes: ['username'] },
          {
            model: DetailOrder,
            as: 'detailOrders',
            include: [
              { model: AssetModel, as: 'assetModel' },
              { model: ConsumableModel, as: 'consumableModel' }
            ]
          }
        ]
      });

      res.status(201).json({ success: true, data: createdOrder });
    } catch (error) {
      console.error('Create purchase order error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// Update purchase order status
router.put('/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('UPDATE', 'purchase_orders'),
  async (req, res) => {
    try {
      const { status, notes } = req.body;

      const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);
      
      if (!purchaseOrder) {
        return res.status(404).json({ success: false, error: 'Purchase order not found' });
      }

      await purchaseOrder.update({
        status: status || purchaseOrder.status,
        notes: notes !== undefined ? notes : purchaseOrder.notes
      });

      const updatedOrder = await PurchaseOrder.findByPk(purchaseOrder.purchase_order_id, {
        include: [
          { model: Supplier, as: 'supplier' },
          { model: SystemUser, as: 'createdBy', attributes: ['username'] },
          {
            model: DetailOrder,
            as: 'detailOrders',
            include: [
              { model: AssetModel, as: 'assetModel' },
              { model: ConsumableModel, as: 'consumableModel' }
            ]
          }
        ]
      });

      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      console.error('Update purchase order error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

export default router;