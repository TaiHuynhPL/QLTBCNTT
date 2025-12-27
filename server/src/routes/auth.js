import express from 'express';
import jwt from 'jsonwebtoken';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const { SystemUser, AssetHolder } = models;

// Sign up (create new account)
router.post('/signup', async (req, res) => {
  try {
    const { username, password, user_role, asset_holder_id } = req.body;
    if (!username || !password || !user_role) {
      return res.status(400).json({ error: 'Username, password, and user_role are required' });
    }

    // Check if username already exists
    const existingUser = await SystemUser.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Optionally check asset_holder_id exists if provided
    let assetHolder = null;
    if (asset_holder_id) {
      assetHolder = await AssetHolder.findByPk(asset_holder_id);
      if (!assetHolder) {
        return res.status(400).json({ error: 'Invalid asset_holder_id' });
      }
    }

    // Create user
    const newUser = await SystemUser.create({
      username,
      password_hash: password,
      user_role,
      asset_holder_id: asset_holder_id || null,
      is_active: true
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        system_user_id: newUser.system_user_id,
        username: newUser.username,
        user_role: newUser.user_role,
        asset_holder_id: newUser.asset_holder_id
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await SystemUser.findOne({
      where: { username },
      include: [{
        model: AssetHolder,
        as: 'assetHolder',
        attributes: ['full_name', 'email', 'department']
      }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    const token = jwt.sign(
      { 
        system_user_id: user.system_user_id,
        username: user.username,
        user_role: user.user_role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      user: {
        system_user_id: user.system_user_id,
        username: user.username,
        user_role: user.user_role,
        full_name: user.assetHolder?.full_name || username,
        email: user.assetHolder?.email,
        department: user.assetHolder?.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await SystemUser.findByPk(req.user.system_user_id, {
      attributes: { exclude: ['password_hash'] },
      include: [{
        model: AssetHolder,
        as: 'assetHolder',
        attributes: ['full_name', 'email', 'department', 'job_title']
      }]
    });

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal, but log the activity)
router.post('/logout', authenticateToken, async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;