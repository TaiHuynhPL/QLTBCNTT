import sequelize from '../config/database.js';
import Supplier from './Supplier.js';
import Location from './Location.js';
import AssetHolder from './AssetHolder.js';
import SystemUser from './SystemUser.js';
import AssetModel from './AssetModel.js';
import ConsumableModel from './ConsumableModel.js';
import PurchaseOrder from './PurchaseOrder.js';
import DetailOrder from './DetailOrder.js';
import Asset from './Asset.js';
import ConsumableStock from './ConsumableStock.js';
import Assignment from './Assignment.js';
import ConsumableCheckout from './ConsumableCheckout.js';
import MaintenanceLog from './MaintenanceLog.js';
import ActivityLog from './ActivityLog.js';

// Define associations
SystemUser.belongsTo(AssetHolder, { foreignKey: 'asset_holder_id', as: 'assetHolder' });
AssetHolder.hasOne(SystemUser, { foreignKey: 'asset_holder_id', as: 'systemUser' });

Asset.belongsTo(AssetModel, { foreignKey: 'asset_model_id', as: 'assetModel' });
Asset.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Asset.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

AssetModel.hasMany(Asset, { foreignKey: 'asset_model_id', as: 'assets' });
Supplier.hasMany(Asset, { foreignKey: 'supplier_id', as: 'assets' });
Location.hasMany(Asset, { foreignKey: 'location_id', as: 'assets' });

PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
PurchaseOrder.belongsTo(SystemUser, { foreignKey: 'created_by_user_id', as: 'createdBy' });
PurchaseOrder.hasMany(DetailOrder, { foreignKey: 'purchase_order_id', as: 'detailOrders' });

DetailOrder.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });
DetailOrder.belongsTo(AssetModel, { foreignKey: 'asset_model_id', as: 'assetModel' });
DetailOrder.belongsTo(ConsumableModel, { foreignKey: 'consumable_model_id', as: 'consumableModel' });

Assignment.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
Assignment.belongsTo(AssetHolder, { foreignKey: 'asset_holder_id', as: 'assetHolder' });
Assignment.belongsTo(Asset, { foreignKey: 'parent_asset_id', as: 'parentAsset' });

Asset.hasMany(Assignment, { foreignKey: 'asset_id', as: 'assignments' });
AssetHolder.hasMany(Assignment, { foreignKey: 'asset_holder_id', as: 'assignments' });

ConsumableStock.belongsTo(ConsumableModel, { foreignKey: 'consumable_model_id', as: 'consumableModel' });
ConsumableStock.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

ConsumableModel.hasMany(ConsumableStock, { foreignKey: 'consumable_model_id', as: 'stocks' });
Location.hasMany(ConsumableStock, { foreignKey: 'location_id', as: 'stocks' });

ConsumableCheckout.belongsTo(AssetHolder, { foreignKey: 'asset_holder_id', as: 'assetHolder' });
ConsumableCheckout.belongsTo(ConsumableModel, { foreignKey: 'consumable_model_id', as: 'consumableModel' });

AssetHolder.hasMany(ConsumableCheckout, { foreignKey: 'asset_holder_id', as: 'checkouts' });
ConsumableModel.hasMany(ConsumableCheckout, { foreignKey: 'consumable_model_id', as: 'checkouts' });

MaintenanceLog.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
MaintenanceLog.belongsTo(AssetHolder, { foreignKey: 'technician_id', as: 'technician' });

Asset.hasMany(MaintenanceLog, { foreignKey: 'asset_id', as: 'maintenanceLogs' });
AssetHolder.hasMany(MaintenanceLog, { foreignKey: 'technician_id', as: 'maintenanceLogs' });

ActivityLog.belongsTo(SystemUser, { foreignKey: 'user_id', as: 'user' });
SystemUser.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });


AssetHolder.belongsTo(SystemUser, { foreignKey: 'system_user_id', as: 'system_user' });
SystemUser.hasOne(AssetHolder, { foreignKey: 'system_user_id' });

const models = {
  sequelize,
  Supplier,
  Location,
  AssetHolder,
  SystemUser,
  AssetModel,
  ConsumableModel,
  PurchaseOrder,
  DetailOrder,
  Asset,
  ConsumableStock,
  Assignment,
  ConsumableCheckout,
  MaintenanceLog,
  ActivityLog
};

export default models;