import { DataTypes } from 'sequelize';
import sequelize from '../db/index.js';
import User from './user.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  type: {
    type: DataTypes.STRING, // income or expense
    allowNull: false
  }
}, {
  tableName: 'transactions',
  timestamps: true
});

// Association
Transaction.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Transaction, { foreignKey: 'userId' });

export default Transaction;