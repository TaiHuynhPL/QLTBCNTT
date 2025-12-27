import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConsumableStock = sequelize.define('ConsumableStock', {
  stock_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  consumable_model_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'consumable_models',
      key: 'consumable_model_id'
    },
    onDelete: 'CASCADE'
  },
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'locations',
      key: 'location_id'
    },
    onDelete: 'CASCADE'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  min_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
  tableName: 'consumable_stocks',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['consumable_model_id', 'location_id']
    }
  ]
});

export default ConsumableStock;