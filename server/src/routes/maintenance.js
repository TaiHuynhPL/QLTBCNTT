
import express from 'express';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();
const { MaintenanceLog, Asset, AssetHolder, AssetModel } = models;

// Get maintenance logs by asset_id (for AssetDetail)
router.get('/asset/:id', authenticateToken, async (req, res) => {
  try {
    const logs = await MaintenanceLog.findAll({
      where: { asset_id: req.params.id },
      include: [
        {
          model: Asset,
          as: 'asset',
          include: [{ model: AssetModel, as: 'assetModel' }]
        },
        { model: AssetHolder, as: 'technician' }
      ],
      order: [['maintenance_date', 'DESC']]
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get maintenance logs by asset_id error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get maintenance logs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { asset_id } = req.query;

    const where = {};
    if (asset_id) where.asset_id = asset_id;

    const logs = await MaintenanceLog.findAll({
      where,
      include: [
        {
          model: Asset,
          as: 'asset',
          include: [{ model: AssetModel, as: 'assetModel' }]
        },
        { model: AssetHolder, as: 'technician' }
      ],
      order: [['maintenance_date', 'DESC']]
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get maintenance logs error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create maintenance log
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager', 'Staff'),
  logActivity('CREATE', 'maintenance_logs'),
  async (req, res) => {
    try {
      const {
        asset_id,
        maintenance_date,
        description,
        maintenance_cost,
        technician_id
      } = req.body;

      // Validate required fields
      if (!asset_id || !maintenance_date || !description || !technician_id) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Check if asset exists
      const asset = await Asset.findByPk(asset_id);
      if (!asset) {
        return res.status(404).json({ success: false, error: 'Asset not found' });
      }

      const log = await MaintenanceLog.create({
        asset_id,
        maintenance_date,
        description,
        maintenance_cost,
        technician_id
      });

      const createdLog = await MaintenanceLog.findByPk(log.maintenance_log_id, {
        include: [
          {
            model: Asset,
            as: 'asset',
            include: [{ model: AssetModel, as: 'assetModel' }]
          },
          { model: AssetHolder, as: 'technician' }
        ]
      });

      res.status(201).json({ success: true, data: createdLog });
    } catch (error) {
      console.error('Create maintenance log error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

export default router;