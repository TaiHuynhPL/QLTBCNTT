import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConsumableModel = sequelize.define('ConsumableModel', {
  consumable_model_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  consumable_model_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  manufacturer: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model_no: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
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
  tableName: 'consumable_models',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['consumable_model_name', 'manufacturer']
    }
  ]
});

export default ConsumableModel;