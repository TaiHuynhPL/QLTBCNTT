import express from 'express';
import models from '../models/index.js';
import { authenticateToken, authorize } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';
import { Op } from 'sequelize';

const router = express.Router();
const { Location } = models;

// GET /locations - Get all locations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 100 } = req.query;
    
    const where = {};
    if (search) {
      where.location_name = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows } = await Location.findAndCountAll({
      where,
      order: [['location_name', 'ASC']],
      offset: (page - 1) * limit,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        locations: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /locations/:id - Get location by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);

    if (!location) {
      return res.status(404).json({ success: false, error: 'Location not found' });
    }

    res.json({ success: true, data: location });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /locations - Create location
router.post('/',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('CREATE', 'locations'),
  async (req, res) => {
    try {
      const { location_name, location_type, description } = req.body;

      if (!location_name) {
        return res.status(400).json({
          success: false,
          error: 'location_name is required'
        });
      }

      const location = await Location.create({
        location_name,
        location_type: location_type || 'Warehouse',
        description
      });

      res.status(201).json({
        success: true,
        message: 'Location created successfully',
        data: location
      });
    } catch (error) {
      console.error('Create location error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// PUT /locations/:id - Update location
router.put('/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('UPDATE', 'locations'),
  async (req, res) => {
    try {
      const { location_name, location_type, description } = req.body;
      const location = await Location.findByPk(req.params.id);

      if (!location) {
        return res.status(404).json({ success: false, error: 'Location not found' });
      }

      if (location_name) location.location_name = location_name;
      if (location_type) location.location_type = location_type;
      if (description) location.description = description;

      await location.save();

      res.json({
        success: true,
        message: 'Location updated successfully',
        data: location
      });
    } catch (error) {
      console.error('Update location error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE /locations/:id - Delete location
router.delete('/:id',
  authenticateToken,
  authorize('Admin', 'Manager'),
  logActivity('DELETE', 'locations'),
  async (req, res) => {
    try {
      const location = await Location.findByPk(req.params.id);

      if (!location) {
        return res.status(404).json({ success: false, error: 'Location not found' });
      }

      await location.destroy();

      res.json({
        success: true,
        message: 'Location deleted successfully'
      });
    } catch (error) {
      console.error('Delete location error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

export default router;
