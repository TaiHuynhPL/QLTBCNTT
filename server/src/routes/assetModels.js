import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

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

// Create new asset model
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('CREATE', 'asset_models'),
  async (req, res) => {
    try {
      const { model_name, manufacturer } = req.body;

      if (!model_name) {
        return res.status(400).json({ success: false, error: 'Tên loại tài sản là bắt buộc' });
      }

      const newModel = await AssetModel.create({
        model_name,
        manufacturer: manufacturer || null
      });

      res.status(201).json({
        success: true,
        message: 'Loại tài sản đã được tạo thành công',
        data: newModel
      });
    } catch (error) {
      console.error('Create asset model error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

// Update asset model
router.put('/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('UPDATE', 'asset_models'),
  async (req, res) => {
    try {
      const model = await AssetModel.findByPk(req.params.id);

      if (!model) {
        return res.status(404).json({ success: false, error: 'Loại tài sản không tồn tại' });
      }

      const { model_name, manufacturer } = req.body;

      if (!model_name) {
        return res.status(400).json({ success: false, error: 'Tên loại tài sản là bắt buộc' });
      }

      await model.update({
        model_name,
        manufacturer: manufacturer || null
      });

      res.json({
        success: true,
        message: 'Loại tài sản đã được cập nhật thành công',
        data: model
      });
    } catch (error) {
      console.error('Update asset model error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

// Delete asset model
router.delete('/:id',
  authenticateToken,
  authorize('Admin'),
  logActivity('DELETE', 'asset_models'),
  async (req, res) => {
    try {
      const model = await AssetModel.findByPk(req.params.id);

      if (!model) {
        return res.status(404).json({ success: false, error: 'Loại tài sản không tồn tại' });
      }

      // Check if this model is used in Asset or other relations
      const { Asset } = models;
      const usedInAsset = await Asset.count({
        where: { asset_model_id: req.params.id }
      });

      if (usedInAsset > 0) {
        return res.status(400).json({
          success: false,
          error: 'Không thể xóa loại tài sản này vì nó đang được sử dụng'
        });
      }

      await model.destroy();

      res.json({
        success: true,
        message: 'Loại tài sản đã được xóa thành công'
      });
    } catch (error) {
      console.error('Delete asset model error:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);

export default router;
