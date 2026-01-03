import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();
const { ConsumableModel } = models;

// Get all consumable models with search and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { consumable_model_name: { [Op.iLike]: `%${search}%` } },
        { manufacturer: { [Op.iLike]: `%${search}%` } },
        { model_no: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ConsumableModel.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        consumableModels: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get consumable models error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get single consumable model by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const model = await ConsumableModel.findByPk(req.params.id);

    if (!model) {
      return res.status(404).json({ success: false, error: 'Consumable model not found' });
    }

    res.json({ success: true, data: model });
  } catch (error) {
    console.error('Get consumable model error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create new consumable model (Admin and Manager only)
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('CREATE', 'consumable_models'),
  async (req, res) => {
    try {
      const {
        consumable_model_name,
        manufacturer,
        model_no,
        specifications
      } = req.body;

      // Validate required fields
      if (!consumable_model_name) {
        return res.status(400).json({ success: false, error: 'Tên mô hình vật tư là bắt buộc' });
      }

      // Check for duplicate model_no if provided
      if (model_no) {
        const existingModel = await ConsumableModel.findOne({ where: { model_no } });
        if (existingModel) {
          return res.status(400).json({ success: false, error: 'Mã model đã tồn tại' });
        }
      }

      // Check for duplicate name and manufacturer combination
      if (manufacturer) {
        const existingModel = await ConsumableModel.findOne({
          where: {
            consumable_model_name,
            manufacturer
          }
        });
        if (existingModel) {
          return res.status(400).json({ success: false, error: 'Mô hình với tên và hãng sản xuất này đã tồn tại' });
        }
      }

      const newModel = await ConsumableModel.create({
        consumable_model_name,
        manufacturer: manufacturer || null,
        model_no: model_no || null,
        specifications: specifications || null
      });

      res.status(201).json({
        success: true,
        message: 'Mô hình vật tư đã được tạo thành công',
        data: newModel
      });
    } catch (error) {
      console.error('Create consumable model error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

// Update consumable model (Admin and Manager only)
router.put('/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('UPDATE', 'consumable_models'),
  async (req, res) => {
    try {
      const model = await ConsumableModel.findByPk(req.params.id);

      if (!model) {
        return res.status(404).json({ success: false, error: 'Mô hình vật tư không tồn tại' });
      }

      const {
        consumable_model_name,
        manufacturer,
        model_no,
        specifications
      } = req.body;

      // Validate required fields
      if (!consumable_model_name) {
        return res.status(400).json({ success: false, error: 'Tên mô hình vật tư là bắt buộc' });
      }

      // Check for duplicate model_no if it's different from current
      if (model_no && model_no !== model.model_no) {
        const existingModel = await ConsumableModel.findOne({ where: { model_no } });
        if (existingModel) {
          return res.status(400).json({ success: false, error: 'Mã model đã tồn tại' });
        }
      }

      // Update the model
      await model.update({
        consumable_model_name,
        manufacturer: manufacturer || null,
        model_no: model_no || null,
        specifications: specifications || null,
        updated_at: new Date()
      });

      res.json({
        success: true,
        message: 'Mô hình vật tư đã được cập nhật thành công',
        data: model
      });
    } catch (error) {
      console.error('Update consumable model error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

// Delete consumable model (Admin only)
router.delete('/:id',
  authenticateToken,
  authorize('Admin'),
  logActivity('DELETE', 'consumable_models'),
  async (req, res) => {
    try {
      const model = await ConsumableModel.findByPk(req.params.id);

      if (!model) {
        return res.status(404).json({ success: false, error: 'Mô hình vật tư không tồn tại' });
      }

      // Check if this model is used in ConsumableStock or other relations
      const { ConsumableStock } = models;
      const usedInStock = await ConsumableStock.count({
        where: { consumable_model_id: req.params.id }
      });

      if (usedInStock > 0) {
        return res.status(400).json({
          success: false,
          error: 'Không thể xóa mô hình vật tư này vì nó đang được sử dụng trong tồn kho'
        });
      }

      await model.destroy();

      res.json({
        success: true,
        message: 'Mô hình vật tư đã được xóa thành công'
      });
    } catch (error) {
      console.error('Delete consumable model error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

export default router;
