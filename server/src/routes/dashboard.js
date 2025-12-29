
import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const { Asset, ConsumableStock, ActivityLog, SystemUser, PurchaseOrder, Location, AssetModel } = models;

// GET /dashboard/kpis
router.get('/kpis', authenticateToken, async (req, res) => {
  try {
    const totalAssets = await Asset.count();
    const totalModels = await AssetModel.count();
    const inUse = await Asset.count({ where: { current_status: 'Deployed' } });
    const inStock = await Asset.count({ where: { current_status: 'In Stock' } });
    res.json({ success: true, data: [
      { title: 'Tổng tài sản', value: totalAssets, color: 'bg-indigo-600', icon: 'Server', sub: `+${inUse} đang sử dụng` },
      { title: 'Model thiết bị', value: totalModels, color: 'bg-blue-500', icon: 'Cpu', sub: `+${inStock} trong kho` },
      { title: 'Đang sử dụng', value: inUse, color: 'bg-green-500', icon: 'Activity', sub: `+${inUse} thiết bị` },
      { title: 'Trong kho', value: inStock, color: 'bg-gray-500', icon: 'Package', sub: `+${inStock} thiết bị` },
    ] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /dashboard/categories
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const modelsList = await AssetModel.findAll();
    const assets = await Asset.findAll();
    const counts = modelsList.map(m => ({
      name: m.model_name,
      value: assets.filter(a => a.asset_model_id === m.asset_model_id).length
    }));
    res.json({ success: true, data: counts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /dashboard/movements
router.get('/movements', authenticateToken, async (req, res) => {
  try {
    const data = [
      { month: '01/2025', nhap: 20, xuat: 10 },
      { month: '02/2025', nhap: 15, xuat: 12 },
      { month: '03/2025', nhap: 30, xuat: 20 },
      { month: '04/2025', nhap: 25, xuat: 18 },
      { month: '05/2025', nhap: 22, xuat: 15 },
      { month: '06/2025', nhap: 18, xuat: 20 },
      { month: '07/2025', nhap: 28, xuat: 25 },
      { month: '08/2025', nhap: 24, xuat: 22 },
      { month: '09/2025', nhap: 20, xuat: 18 },
      { month: '10/2025', nhap: 27, xuat: 23 },
      { month: '11/2025', nhap: 19, xuat: 17 },
      { month: '12/2025', nhap: 30, xuat: 28 },
    ];
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

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
      success: true,
      data: {
        assets: {
          total: totalAssets,
          deployed: deployedAssets,
          inStock: inStockAssets,
          inRepair: inRepairAssets,
          retired: retiredAssets
        },
        lowStockCount,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get recent activities
router.get('/recent-activities', authenticateToken, async (req, res) => {
  try {
    const activities = await ActivityLog.findAll({
      include: [
        { model: SystemUser, as: 'user', attributes: ['username', 'asset_holder_id'],
          include: [{ model: models.AssetHolder, as: 'assetHolder', attributes: ['full_name'] }] }
      ],
      order: [['action_timestamp', 'DESC']],
      limit: 10
    });


    // Helper lấy tên holder
    const getHolderName = async (holder_id) => {
      if (!holder_id) return null;
      const holder = await models.AssetHolder.findByPk(holder_id);
      return holder ? holder.full_name : null;
    };
    // Helper lấy tên asset
    const getAssetName = async (item_id) => {
      if (!item_id) return null;
      const asset = await models.Asset.findByPk(item_id);
      return asset ? asset.asset_tag : null;
    };
    // Helper dịch action_type sang tiếng Việt
    const actionTypeVN = (type) => {
      switch (type) {
        case 'Checkout': return 'Bàn giao';
        case 'Checkin': return 'Thu hồi';
        case 'Update': return 'Cập nhật';
        case 'Create': return 'Tạo mới';
        case 'Delete': return 'Xóa';
        case 'Approve PO': return 'Duyệt phiếu';
        case 'Logout': return 'Đăng xuất';
        default: return type;
      }
    };

    // Helper dịch target_table sang tiếng Việt
    const tableVN = (table) => {
      switch ((table || '').toLowerCase()) {
        case 'assetholders': return 'Người sử dụng';
        case 'assets': return 'Thiết bị';
        case 'assignments': return 'Bàn giao';
        case 'locations': return 'Vị trí';
        case 'systemusers': return 'Tài khoản';
        case 'purchaseorders': return 'Phiếu mua';
        default: return table;
      }
    };

    // Map enrich dữ liệu
    const mapped = await Promise.all(activities.map(async act => {
      let changeDetails = act.change_details;
      let holderName = '';
      let itemName = '';
      if (changeDetails && typeof changeDetails === 'object') {
        if (changeDetails.holder_id) {
          holderName = await getHolderName(changeDetails.holder_id);
          changeDetails.holder_name = holderName;
        }
        if (changeDetails.item_id) {
          itemName = await getAssetName(changeDetails.item_id);
          changeDetails.item_name = itemName;
        }
      }
      // Lấy tên người dùng ưu tiên full_name, fallback username
      let userName = '';
      if (act.user) {
        if (act.user.assetHolder && act.user.assetHolder.full_name) {
          userName = act.user.assetHolder.full_name;
        } else if (act.user.username) {
          userName = act.user.username;
        }
      }
      // Format mô tả tiếng Việt
      let descriptionVN = '';
      const actionVN = actionTypeVN(act.action_type);
      const tableNameVN = tableVN(act.target_table);
      const recordId = act.target_record_id ? ` (ID: ${act.target_record_id})` : '';
      if (userName && actionVN && tableNameVN) {
        // Nếu là các hành động đặc biệt có tên thiết bị/người nhận thì ưu tiên
        if (act.action_type === 'Checkout' && itemName && holderName) {
          descriptionVN = `${userName} đã bàn giao thiết bị ${itemName} cho ${holderName}`;
        } else if (act.action_type === 'Checkin' && itemName && holderName) {
          descriptionVN = `${userName} đã thu hồi thiết bị ${itemName} từ ${holderName}`;
        } else if (itemName) {
          descriptionVN = `${userName} đã ${actionVN.toLowerCase()} ${tableNameVN} ${itemName}`;
        } else if (holderName) {
          descriptionVN = `${userName} đã ${actionVN.toLowerCase()} ${tableNameVN} ${holderName}`;
        } else {
          descriptionVN = `${userName} đã ${actionVN.toLowerCase()} ${tableNameVN}${recordId}`;
        }
      } else if (userName && actionVN) {
        descriptionVN = `${userName} đã ${actionVN.toLowerCase()}${recordId}`;
      } else if (act.description) {
        // Fallback: thay thế tên trong description
        descriptionVN = act.description.replace(/User \d+/, userName || 'Người dùng');
      } else {
        descriptionVN = '';
      }
      return {
        ...act.toJSON(),
        user: userName,
        action_type_vn: actionVN,
        description_vn: descriptionVN,
        change_details: changeDetails
      };
    }));
    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get asset distribution
router.get('/asset-distribution', authenticateToken, async (req, res) => {
  try {
    // By location
    const byLocationRaw = await Asset.findAll({
      attributes: [
        'location_id',
        [models.sequelize.fn('COUNT', models.sequelize.col('Asset.asset_id')), 'count']
      ],
      include: [
        { model: Location, as: 'location', attributes: ['location_name'] }
      ],
      group: [
        'Asset.location_id',
        'location.location_id',
        'location.location_name'
      ]
    });
    // Sắp xếp và lấy top 5
    const byLocation = byLocationRaw
      .sort((a, b) => b.get('count') - a.get('count'))
      .slice(0, 5);

    // By type
    const byTypeRaw = await Asset.findAll({
      attributes: [
        'asset_model_id',
        [models.sequelize.fn('COUNT', models.sequelize.col('Asset.asset_id')), 'count']
      ],
      include: [
        { model: AssetModel, as: 'assetModel', attributes: ['asset_type'] }
      ],
      group: [
        'Asset.asset_model_id',
        'assetModel.asset_model_id',
        'assetModel.asset_type'
      ]
    });
    const byType = byTypeRaw
      .sort((a, b) => b.get('count') - a.get('count'))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        byLocation,
        byType
      }
    });
  } catch (error) {
    console.error('Get asset distribution error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;