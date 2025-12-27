import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Assignment = sequelize.define('Assignment', {
  assignment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assignment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
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
  asset_holder_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'asset_holders',
      key: 'asset_holder_id'
    }
  },
  parent_asset_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'assets',
      key: 'asset_id'
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
  tableName: 'assignments',
  timestamps: false,
  validate: {
    // Polymorphic constraint: must have either asset_holder_id OR parent_asset_id, not both
    polymorphicConstraint() {
      if ((this.asset_holder_id && this.parent_asset_id) || 
          (!this.asset_holder_id && !this.parent_asset_id)) {
        throw new Error('Assignment must have either asset_holder_id OR parent_asset_id, not both or neither');
      }
    },
    // Date validation: return_date must be >= assignment_date
    dateValidation() {
      if (this.return_date && this.assignment_date && 
          new Date(this.return_date) < new Date(this.assignment_date)) {
        throw new Error('return_date must be greater than or equal to assignment_date');
      }
    }
  }
});

export default Assignment;