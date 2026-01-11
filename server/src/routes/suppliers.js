import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

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

// Create new supplier
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('CREATE', 'suppliers'),
  async (req, res) => {
    try {
      const { supplier_name, contact_info } = req.body;

      if (!supplier_name) {
        return res.status(400).json({ success: false, error: 'Tên nhà cung cấp là bắt buộc' });
      }

      const newSupplier = await Supplier.create({
        supplier_name,
        contact_info: contact_info || null
      });

      res.status(201).json({
        success: true,
        message: 'Nhà cung cấp đã được tạo thành công',
        data: newSupplier
      });
    } catch (error) {
      console.error('Create supplier error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

// Update supplier
router.put('/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('UPDATE', 'suppliers'),
  async (req, res) => {
    try {
      const supplier = await Supplier.findByPk(req.params.id);

      if (!supplier) {
        return res.status(404).json({ success: false, error: 'Nhà cung cấp không tồn tại' });
      }

      const { supplier_name, contact_info } = req.body;

      if (!supplier_name) {
        return res.status(400).json({ success: false, error: 'Tên nhà cung cấp là bắt buộc' });
      }

      await supplier.update({
        supplier_name,
        contact_info: contact_info || null
      });

      res.json({
        success: true,
        message: 'Nhà cung cấp đã được cập nhật thành công',
        data: supplier
      });
    } catch (error) {
      console.error('Update supplier error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

// Delete supplier
router.delete('/:id',
  authenticateToken,
  authorize('Admin'),
  logActivity('DELETE', 'suppliers'),
  async (req, res) => {
    try {
      const supplier = await Supplier.findByPk(req.params.id);

      if (!supplier) {
        return res.status(404).json({ success: false, error: 'Nhà cung cấp không tồn tại' });
      }

      // Check if this supplier is used in PurchaseOrder or other relations
      const { PurchaseOrder } = models;
      const usedInPurchaseOrder = await PurchaseOrder.count({
        where: { supplier_id: req.params.id }
      });

      if (usedInPurchaseOrder > 0) {
        return res.status(400).json({
          success: false,
          error: 'Không thể xóa nhà cung cấp này vì nó đang được sử dụng trong đơn đặt hàng'
        });
      }

      await supplier.destroy();

      res.json({
        success: true,
        message: 'Nhà cung cấp đã được xóa thành công'
      });
    } catch (error) {
      console.error('Delete supplier error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

export default router;
