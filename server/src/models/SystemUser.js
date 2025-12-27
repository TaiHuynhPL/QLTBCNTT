import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

const SystemUser = sequelize.define('SystemUser', {
  system_user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asset_holder_id: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: true,
    references: {
      model: 'asset_holders',
      key: 'asset_holder_id'
    }
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  user_role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['Admin', 'Manager', 'Staff']]
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
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
  tableName: 'system_users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    }
  }
});

SystemUser.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

export default SystemUser;