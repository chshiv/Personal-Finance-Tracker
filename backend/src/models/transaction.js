import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';
import User from './user.js';
import Category from './category.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.DECIMAL(12,2),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    field: "user_id"   // 👈 maps to DB column
  },
  categoryId: {
    type: DataTypes.UUID,
    field: "category_id"
  }
}, {
  tableName: "transactions",
  timestamps: false,
  underscored: true
});

export default Transaction;