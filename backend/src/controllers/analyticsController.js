import Transaction from '../models/transaction.js';
import redisClient from '../db/redis.js';

/* =========================
   GET /api/analytics
========================= */
export const getAnalytics = async (req, res) => {
  try {
    const { id, role } = req.user;

    const cacheKey = role === 'admin' ? 'analytics:admin' : `analytics:${id}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Serving analytics from cache');
      return res.json(JSON.parse(cachedData));
    }

    let whereCondition = {};
    if (role !== 'admin') {
      whereCondition.userId = id;
    }

    const income = await Transaction.sum('amount', {
      where: { ...whereCondition, type: 'income' }
    });

    const expense = await Transaction.sum('amount', {
      where: { ...whereCondition, type: 'expense' }
    });

    const data = {
      totalIncome: income || 0,
      totalExpense: expense || 0,
      balance: (income || 0) - (expense || 0)
    };

    // Cache for 15 minutes (900 sec)
    await redisClient.setEx(cacheKey, 900, JSON.stringify(data));

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};