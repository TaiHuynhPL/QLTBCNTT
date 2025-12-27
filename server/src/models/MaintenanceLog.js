import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MaintenanceLog = sequelize.define('MaintenanceLog', {
  maintenance_log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assets',
      key: 'asset_id'
    },
    onDelete: 'CASCADE'
  },
  maintenance_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  maintenance_cost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'asset_holders',
      key: 'asset_holder_id'
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
  tableName: 'maintenance_logs',
  timestamps: false
});

export default MaintenanceLog;