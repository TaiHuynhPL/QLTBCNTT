import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  purchase_order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_code: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'supplier_id'
    }
  },
  created_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'system_users',
      key: 'system_user_id'
    }
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['Draft', 'Pending Approval', 'Approved', 'Rejected', 'Completed', 'Cancelled']]
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'purchase_orders',
  timestamps: false
});

export default PurchaseOrder;