import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const { Asset, ConsumableStock, ActivityLog, SystemUser, PurchaseOrder, Location, AssetModel } = models;

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Asset statistics
    const totalAssets = await Asset.count();
    const deployedAssets = await Asset.count({ where: { current_status: 'Deployed' } });
    const inStockAssets = await Asset.count({ where: { current_status: 'In Stock' } });
    const inRepairAssets = await Asset.count({ where: { current_status: 'In Repair' } });
    const retiredAssets = await Asset.count({ where: { current_status: 'Retired' } });

    // Low stock count
    const lowStockCount = await ConsumableStock.count({
      where: {
        quantity: {
          [Op.lt]: models.sequelize.col('min_quantity')
        }
      }
    });

    // Pending purchase orders
    const pendingOrders = await PurchaseOrder.count({
      where: { status: { [Op.in]: ['Draft', 'Pending Approval'] } }
    });

    res.json({
      assets: {
        total: totalAssets,
        deployed: deployedAssets,
        inStock: inStockAssets,
        inRepair: inRepairAssets,
        retired: retiredAssets
      },
      lowStockCount,
      pendingOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activities
router.get('/recent-activities', authenticateToken, async (req, res) => {
  try {
    const activities = await ActivityLog.findAll({
      include: [
        { model: SystemUser, as: 'user', attributes: ['username'] }
      ],
      order: [['action_timestamp', 'DESC']],
      limit: 20
    });

    res.json({ activities });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get asset distribution
router.get('/asset-distribution', authenticateToken, async (req, res) => {
  try {
    // By location
    const byLocation = await Asset.findAll({
      attributes: [
        'location_id',
        [models.sequelize.fn('COUNT', models.sequelize.col('asset_id')), 'count']
      ],
      include: [
        { model: Location, as: 'location', attributes: ['location_name'] }
      ],
      group: ['location_id', 'location.location_id', 'location.location_name']
    });

    // By type
    const byType = await Asset.findAll({
      attributes: [
        'asset_model_id',
        [models.sequelize.fn('COUNT', models.sequelize.col('asset_id')), 'count']
      ],
      include: [
        { model: AssetModel, as: 'assetModel', attributes: ['asset_type'] }
      ],
      group: ['asset_model_id', 'assetModel.asset_model_id', 'assetModel.asset_type']
    });

    res.json({
      byLocation,
      byType
    });
  } catch (error) {
    console.error('Get asset distribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;