import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DetailOrder = sequelize.define('DetailOrder', {
  detail_order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'purchase_orders',
      key: 'purchase_order_id'
    },
    onDelete: 'CASCADE'
  },
  asset_model_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'asset_models',
      key: 'asset_model_id'
    }
  },
  consumable_model_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'consumable_models',
      key: 'consumable_model_id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  unit_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  }
}, {
  tableName: 'detail_orders',
  timestamps: false,
  validate: {
    // Polymorphic constraint: must have either asset_model_id OR consumable_model_id, not both
    polymorphicConstraint() {
      if ((this.asset_model_id && this.consumable_model_id) || 
          (!this.asset_model_id && !this.consumable_model_id)) {
        throw new Error('DetailOrder must have either asset_model_id OR consumable_model_id, not both or neither');
      }
    }
  }
});

export default DetailOrder;