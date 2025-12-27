import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AssetModel = sequelize.define('AssetModel', {
  asset_model_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  model_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  asset_type: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  specifications: {
    type: DataTypes.JSONB,
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
  tableName: 'asset_models',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['model_name', 'manufacturer']
    }
  ]
});

export default AssetModel;