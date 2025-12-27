import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Asset = sequelize.define('Asset', {
  asset_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asset_tag: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  serial_number: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: true
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  purchase_cost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true
  },
  current_status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['Deployed', 'In Stock', 'In Repair', 'Retired']]
    }
  },
  warranty_months: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  asset_model_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'asset_models',
      key: 'asset_model_id'
    }
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'suppliers',
      key: 'supplier_id'
    }
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'locations',
      key: 'location_id'
    }
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
  tableName: 'assets',
  timestamps: false
});

export default Asset;