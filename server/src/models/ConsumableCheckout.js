import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ConsumableCheckout = sequelize.define('ConsumableCheckout', {
  checkout_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  checkout_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  asset_holder_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'asset_holders',
      key: 'asset_holder_id'
    }
  },
  quantity_checked_out: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  consumable_model_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'consumable_models',
      key: 'consumable_model_id'
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
  tableName: 'consumable_checkouts',
  timestamps: false
});

export default ConsumableCheckout;