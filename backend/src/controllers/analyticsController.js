import Transaction from '../models/transaction.js';
import Category from '../models/category.js';
import redisClient from '../db/redis.js';
import sequelize from '../db/index.js';

export const getAnalytics = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { userId } = req.query; // NEW

    // FIXED CACHE KEY
    const cacheKey =
      role === 'admin'
        ? `analytics:admin:${userId || 'all'}`
        : `analytics:${id}`;

    // 1. Check Cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Serving analytics from cache');
      return res.json(JSON.parse(cachedData));
    }

    // FIXED WHERE CONDITION
    let whereCondition = {};

    if (role === 'admin') {
      if (userId && userId !== 'all') {
        whereCondition.userId = userId; // 🔥 selected user
      }
      // else → all users
    } else {
      whereCondition.userId = id; // normal user
    }

    // 2. TOTAL INCOME & EXPENSE
    const income = await Transaction.sum('amount', {
      where: { ...whereCondition, type: 'income' }
    });

    const expense = await Transaction.sum('amount', {
      where: { ...whereCondition, type: 'expense' }
    });

    // 3. CATEGORY-WISE
    const categoryWiseRaw = await Transaction.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
      ],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ['name']
        }
      ],
      where: whereCondition,
      group: ['category.id', 'category.name'],
      raw: true,
      nest: true
    });

    const categoryWise = categoryWiseRaw.map(row => ({
      category: row.category?.name || "Unknown",
      amount: Number(row.amount)
    }));

    // 4. MONTHLY TREND
    const monthlyTrendRaw = await Transaction.findAll({
      attributes: [
        [sequelize.fn('TO_CHAR', sequelize.col('date'), 'YYYY-MM'), 'month'],
        'type',
        [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
      ],
      where: whereCondition,
      group: [
        sequelize.fn('TO_CHAR', sequelize.col('date'), 'YYYY-MM'),
        'type'
      ],
      order: [
        [sequelize.fn('TO_CHAR', sequelize.col('date'), 'YYYY-MM'), 'ASC']
      ]
    });

    const monthlyMap = {};

    monthlyTrendRaw.forEach(row => {
      const month = row.getDataValue('month');
      const type = row.getDataValue('type');
      const amount = Number(row.getDataValue('amount'));

      if (!monthlyMap[month]) {
        monthlyMap[month] = { month, income: 0, expense: 0 };
      }

      monthlyMap[month][type] = amount;
    });

    const monthlyTrend = Object.values(monthlyMap);

    // 5. BAR DATA
    const incomeVsExpense = [
      { type: 'Income', amount: income || 0 },
      { type: 'Expense', amount: expense || 0 }
    ];

    // FINAL RESPONSE
    const data = {
      totalIncome: income || 0,
      totalExpense: expense || 0,
      balance: (income || 0) - (expense || 0),
      categoryWise,
      monthlyTrend,
      incomeVsExpense
    };

    // CACHE SAVE
    await redisClient.setEx(cacheKey, 900, JSON.stringify(data));

    return res.json(data);

  } catch (error) {
    console.error('Analytics Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};