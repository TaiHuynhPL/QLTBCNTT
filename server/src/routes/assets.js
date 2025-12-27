import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity, captureOriginalData } from '../middleware/activityLogger.js';

const router = express.Router();
const { Asset, AssetModel, Supplier, Location, Assignment, MaintenanceLog, AssetHolder } = models;

// Get all assets with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      location_id, 
      asset_type, 
      search,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};
    
    if (status) where.current_status = status;
    if (location_id) where.location_id = location_id;
    
    if (search) {
      where[Op.or] = [
        { asset_tag: { [Op.iLike]: `%${search}%` } },
        { serial_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Asset.findAndCountAll({
      where,
      include: [
        { model: AssetModel, as: 'assetModel' },
        { model: Supplier, as: 'supplier' },
        { model: Location, as: 'location' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      assets: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single asset
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, {
      include: [
        { model: AssetModel, as: 'assetModel' },
        { model: Supplier, as: 'supplier' },
        { model: Location, as: 'location' },
        {
          model: Assignment,
          as: 'assignments',
          include: [
            { model: AssetHolder, as: 'assetHolder' },
            { model: Asset, as: 'parentAsset' }
          ]
        },
        {
          model: MaintenanceLog,
          as: 'maintenanceLogs',
          include: [{ model: AssetHolder, as: 'technician' }]
        }
      ]
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({ asset });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create asset
router.post('/', 
  authenticateToken, 
  authorize('Admin', 'Manager', 'Staff'),
  logActivity('CREATE', 'assets'),
  async (req, res) => {
    try {
      const {
        asset_tag,
        serial_number,
        purchase_date,
        purchase_cost,
        current_status,
        warranty_months,
        asset_model_id,
        supplier_id,
        location_id
      } = req.body;

      // Validate required fields
      if (!asset_tag || !current_status || !asset_model_id || !location_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check for duplicate asset_tag
      const existingAsset = await Asset.findOne({ where: { asset_tag } });
      if (existingAsset) {
        return res.status(400).json({ error: 'Asset tag already exists' });
      }

      // Check for duplicate serial_number if provided
      if (serial_number) {
        const existingSerial = await Asset.findOne({ where: { serial_number } });
        if (existingSerial) {
          return res.status(400).json({ error: 'Serial number already exists' });
        }
      }

      const asset = await Asset.create({
        asset_tag,
        serial_number,
        purchase_date,
        purchase_cost,
        current_status,
        warranty_months,
        asset_model_id,
        supplier_id,
        location_id
      });

      const createdAsset = await Asset.findByPk(asset.asset_id, {
        include: [
          { model: AssetModel, as: 'assetModel' },
          { model: Supplier, as: 'supplier' },
          { model: Location, as: 'location' }
        ]
      });

      res.status(201).json({ data: createdAsset });
    } catch (error) {
      console.error('Create asset error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

// Update asset
router.put('/:id',
  authenticateToken,
  authorize('Admin', 'Manager', 'Staff'),
  captureOriginalData(Asset, 'id'),
  logActivity('UPDATE', 'assets'),
  async (req, res) => {
    try {
      const asset = await Asset.findByPk(req.params.id);
      
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      const {
        asset_tag,
        serial_number,
        purchase_date,
        purchase_cost,
        current_status,
        warranty_months,
        asset_model_id,
        supplier_id,
        location_id
      } = req.body;

      // Check for duplicate asset_tag if changed
      if (asset_tag && asset_tag !== asset.asset_tag) {
        const existingAsset = await Asset.findOne({ where: { asset_tag } });
        if (existingAsset) {
          return res.status(400).json({ error: 'Asset tag already exists' });
        }
      }

      // Check for duplicate serial_number if changed
      if (serial_number && serial_number !== asset.serial_number) {
        const existingSerial = await Asset.findOne({ where: { serial_number } });
        if (existingSerial) {
          return res.status(400).json({ error: 'Serial number already exists' });
        }
      }

      await asset.update({
        asset_tag: asset_tag || asset.asset_tag,
        serial_number,
        purchase_date,
        purchase_cost,
        current_status: current_status || asset.current_status,
        warranty_months,
        asset_model_id: asset_model_id || asset.asset_model_id,
        supplier_id,
        location_id: location_id || asset.location_id
      });

      const updatedAsset = await Asset.findByPk(asset.asset_id, {
        include: [
          { model: AssetModel, as: 'assetModel' },
          { model: Supplier, as: 'supplier' },
          { model: Location, as: 'location' }
        ]
      });

      res.json({ data: updatedAsset });
    } catch (error) {
      console.error('Update asset error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
);

// Delete asset (soft delete - set status to Retired)
router.delete('/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  captureOriginalData(Asset, 'id'),
  logActivity('DELETE', 'assets'),
  async (req, res) => {
    try {
      const asset = await Asset.findByPk(req.params.id);
      
      if (!asset) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      await asset.update({ current_status: 'Retired' });

      res.json({ message: 'Asset retired successfully', data: asset });
    } catch (error) {
      console.error('Delete asset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;