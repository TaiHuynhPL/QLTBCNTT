
import express from 'express';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();
const { Assignment, Asset, AssetHolder, AssetModel } = models;

// Get assignments by asset_id (for AssetDetail)
router.get('/asset/:id', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      where: { asset_id: req.params.id },
      include: [
        {
          model: Asset,
          as: 'asset',
          include: [{ model: AssetModel, as: 'assetModel' }]
        },
        { model: AssetHolder, as: 'assetHolder' },
        {
          model: Asset,
          as: 'parentAsset',
          include: [{ model: AssetModel, as: 'assetModel' }]
        }
      ],
      order: [['assignment_date', 'DESC']]
    });
    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Get assignments by asset_id error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get all assignments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { asset_id, asset_holder_id, active_only } = req.query;

    const where = {};
    if (asset_id) where.asset_id = asset_id;
    if (asset_holder_id) where.asset_holder_id = asset_holder_id;
    if (active_only === 'true') where.return_date = null;

    const assignments = await Assignment.findAll({
      where,
      include: [
        {
          model: Asset,
          as: 'asset',
          include: [{ model: AssetModel, as: 'assetModel' }]
        },
        { model: AssetHolder, as: 'assetHolder' },
        {
          model: Asset,
          as: 'parentAsset',
          include: [{ model: AssetModel, as: 'assetModel' }]
        }
      ],
      order: [['assignment_date', 'DESC']]
    });

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Create assignment
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager', 'Staff'),
  logActivity('CREATE', 'assignments'),
  async (req, res) => {
    try {
      const {
        assignment_date,
        asset_id,
        asset_holder_id,
        parent_asset_id
      } = req.body;

      // Validate required fields
      if (!assignment_date || !asset_id) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      // Validate polymorphic constraint
      if ((asset_holder_id && parent_asset_id) || (!asset_holder_id && !parent_asset_id)) {
        return res.status(400).json({ 
          success: false,
          error: 'Must specify either asset_holder_id OR parent_asset_id, not both or neither' 
        });
      }

      // Check if asset exists and is available
      const asset = await Asset.findByPk(asset_id);
      if (!asset) {
        return res.status(404).json({ success: false, error: 'Asset not found' });
      }

      // Check if asset is already assigned
      const existingAssignment = await Assignment.findOne({
        where: { asset_id, return_date: null }
      });

      if (existingAssignment) {
        return res.status(400).json({ success: false, error: 'Asset is already assigned' });
      }

      const assignment = await Assignment.create({
        assignment_date,
        asset_id,
        asset_holder_id: asset_holder_id || null,
        parent_asset_id: parent_asset_id || null
      });

      // Update asset status to Deployed
      await asset.update({ current_status: 'Deployed' });

      const createdAssignment = await Assignment.findByPk(assignment.assignment_id, {
        include: [
          {
            model: Asset,
            as: 'asset',
            include: [{ model: AssetModel, as: 'assetModel' }]
          },
          { model: AssetHolder, as: 'assetHolder' },
          {
            model: Asset,
            as: 'parentAsset',
            include: [{ model: AssetModel, as: 'assetModel' }]
          }
        ]
      });

      res.status(201).json({ success: true, data: createdAssignment });
    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// Return asset
router.put('/:id/return',
  authenticateToken,
  authorize('Admin', 'Manager', 'Staff'),
  logActivity('UPDATE', 'assignments'),
  async (req, res) => {
    try {
      const { return_date } = req.body;

      if (!return_date) {
        return res.status(400).json({ success: false, error: 'Return date is required' });
      }

      const assignment = await Assignment.findByPk(req.params.id, {
        include: [{ model: Asset, as: 'asset' }]
      });

      if (!assignment) {
        return res.status(404).json({ success: false, error: 'Assignment not found' });
      }

      if (assignment.return_date) {
        return res.status(400).json({ success: false, error: 'Asset already returned' });
      }

      // Validate return_date >= assignment_date
      if (new Date(return_date) < new Date(assignment.assignment_date)) {
        return res.status(400).json({ success: false, error: 'Return date must be after assignment date' });
      }

      await assignment.update({ return_date });

      // Update asset status to In Stock
      if (assignment.asset) {
        await assignment.asset.update({ current_status: 'In Stock' });
      }

      const updatedAssignment = await Assignment.findByPk(assignment.assignment_id, {
        include: [
          {
            model: Asset,
            as: 'asset',
            include: [{ model: AssetModel, as: 'assetModel' }]
          },
          { model: AssetHolder, as: 'assetHolder' },
          {
            model: Asset,
            as: 'parentAsset',
            include: [{ model: AssetModel, as: 'assetModel' }]
          }
        ]
      });

      res.json({ success: true, data: updatedAssignment });
    } catch (error) {
      console.error('Return asset error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

export default router;