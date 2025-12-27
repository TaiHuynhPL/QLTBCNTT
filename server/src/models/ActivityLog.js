import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ActivityLog = sequelize.define('ActivityLog', {
  activity_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'system_users',
      key: 'system_user_id'
    },
    onDelete: 'SET NULL'
  },
  action_timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  action_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  target_table: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  target_record_id: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  change_details: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  }
}, {
  tableName: 'activity_logs',
  timestamps: false
});

export default ActivityLog;