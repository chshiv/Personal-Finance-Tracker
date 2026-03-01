import Transaction from '../models/transaction.js';
import redisClient from '../db/redis.js';
import { Op } from 'sequelize';
import {checkExtraKeys, checkMissingKeys, validateAmount, validateDescription, validateType, validateCategoryId, validateUserId, validateCategoryExists, validateUserExists } from '../utils/transactionValidators.js';

// GET /api/transactions
export const getTransactions = async (req, res) => {
  try {
    const { id, role } = req.user;

    let transactions;

    if (role === 'admin') {
      // Admin sees all transactions
      transactions = await Transaction.findAll();
    } else {
      // User & read-only see only their transactions
      transactions = await Transaction.findAll({
        where: { userId: id }
      });
    }

    res.json(transactions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   POST /api/transactions
========================= */
export const createTransaction = async (req, res) => {
  try {
    const { id, role } = req.user;
    const body = req.body;

    // Allowed and required keys
    const allowedKeys = ["amount", "description", "type", "categoryId", "userId"];
    const requiredKeys = ["amount", "description", "type"];

    // Check for extra keys
    let error = checkExtraKeys(body, allowedKeys);
    if (error) return res.status(400).json({ message: error });

    // Check for missing required keys
    error = checkMissingKeys(body, requiredKeys);
    if (error) return res.status(400).json({ message: error });

    // Validate individual values
    error = validateAmount(body.amount);
    if (error) return res.status(400).json({ message: error });

    error = validateDescription(body.description);
    if (error) return res.status(400).json({ message: error });

    error = validateType(body.type);
    if (error) return res.status(400).json({ message: error });

    error = validateCategoryId(body.categoryId);
    if (error) return res.status(400).json({ message: error });

    if (body.categoryId) {
      error = await validateCategoryExists(body.categoryId);
      if (error) return res.status(400).json({ message: error });
    }

    error = validateUserId(body.userId, id, role);
    if (error) return res.status(400).json({ message: error });

    if (body.userId) {
      error = await validateUserExists(body.userId, role);
      if (error) return res.status(400).json({ message: error });
    }

    // Determine the target user
    const targetUserId = role === "admin" && body.userId ? body.userId : id;

    // Create the transaction
    const transaction = await Transaction.create({
      amount: body.amount,
      description: body.description,
      type: body.type.toLowerCase(),
      categoryId: body.categoryId || null,
      userId: targetUserId
    });

    // Invalidate analytics cache
    await redisClient.del(`analytics:${targetUserId}`);
    await redisClient.del(`analytics:admin`);

    res.status(201).json(transaction);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   PUT /api/transactions/:id
========================= */
export const updateTransaction = async (req, res) => {
  try {
    const { id: loggedInUserId, role } = req.user;
    const { id: transactionId } = req.params;

    const transaction = await Transaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Role & Ownership Check
    if (role !== 'admin' && transaction.userId !== loggedInUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Allowed fields for update
    const allowedFields = ['amount', 'description', 'type', 'categoryId', 'userId'];

    // Check for extra keys
    const extraKeysError = checkExtraKeys(req.body, allowedFields);
    if (extraKeysError) return res.status(400).json({ message: extraKeysError });

    // Build updates object only with allowed fields provided
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Modular validations
    if (updates.amount !== undefined) {
      const amountError = validateAmount(updates.amount);
      if (amountError) return res.status(400).json({ message: amountError });
    }

    if (updates.description !== undefined) {
      const descriptionError = validateDescription(updates.description);
      if (descriptionError) return res.status(400).json({ message: descriptionError });
    }

    if (updates.type !== undefined) {
      const typeError = validateType(updates.type);
      if (typeError) return res.status(400).json({ message: typeError });
      updates.type = updates.type.toLowerCase(); // normalize type
    }

    if (updates.categoryId !== undefined) {
      if (updates.categoryId === "" || updates.categoryId === null) {
        updates.categoryId = null;
      }
      else {
        const categoryIdError = validateCategoryId(updates.categoryId);
        if (categoryIdError) return res.status(400).json({ message: categoryIdError });

        const categoryExistsError = await validateCategoryExists(updates.categoryId);
        if (categoryExistsError) return res.status(400).json({ message: categoryExistsError });
      }
    }

    if (updates.userId !== undefined) {
      const userIdError = validateUserId(updates.userId, loggedInUserId, role);
      if (userIdError) return res.status(400).json({ message: userIdError });
      // Optional: check if userId exists in DB (admin only)
      const userExistsError = await validateUserExists(updates.userId, role);
      if (userExistsError) return res.status(400).json({ message: userExistsError });
    }

    await transaction.update(updates);

    // Invalidate analytics cache
    await redisClient.del(`analytics:${transaction.userId}`);
    await redisClient.del(`analytics:admin`);

    return res.json({
      message: 'Transaction updated successfully',
      transaction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   DELETE /api/transactions/:id
========================= */
export const deleteTransaction = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) return res.status(404).json({ message: 'Transaction Not found' });

    if (role !== 'admin' && transaction.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await transaction.destroy();

    await redisClient.del(`analytics:${transaction.userId}`);
    await redisClient.del(`analytics:admin`);

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const filterTransactions = async (req, res) => {
  try {
    const { id, role } = req.user;

    let { category, type, minAmount, maxAmount, page, limit } = req.query;

    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    if (type) type = type.trim().toLowerCase();
    if (category) category = category.trim();
    if (minAmount) minAmount = minAmount.trim();
    if (maxAmount) maxAmount = maxAmount.trim();

    const ALLOWED_TYPES = ['income', 'expense'];

    if (type && !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        message: 'Invalid transaction type. Must be income or expense'
      });
    }

    if (minAmount && isNaN(minAmount)) {
      return res.status(400).json({ message: 'minAmount must be a number' });
    }

    if (maxAmount && isNaN(maxAmount)) {
      return res.status(400).json({ message: 'maxAmount must be a number' });
    }

    if (minAmount && Number(minAmount) < 0) {
      return res.status(400).json({ message: 'minAmount cannot be negative' });
    }

    if (maxAmount && Number(maxAmount) < 0) {
      return res.status(400).json({ message: 'maxAmount cannot be negative' });
    }

    if (minAmount && maxAmount && Number(minAmount) > Number(maxAmount)) {
      return res.status(400).json({
        message: 'minAmount cannot be greater than maxAmount'
      });
    }

    // Optional UUID format validation
    if (category && category !== 'uncategorized' && category !== 'null') {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      if (!uuidRegex.test(category)) {
        return res.status(400).json({
          message: 'Invalid category UUID format'
        });
      }
    }

    let where = {};
    if (role !== 'admin') {
      where.userId = id;
    }

    // Category filter
    if (category) {
      if (
        category.toLowerCase() === 'uncategorized' ||
        category === 'null'
      ) {
        where.categoryId = null;
      } else {
        where.categoryId = category;
      }
    }

    if (type) {
      where.type = type;
    }

    if (minAmount || maxAmount) {
      where.amount = {};

      if (minAmount) where.amount[Op.gte] = Number(minAmount);
      if (maxAmount) where.amount[Op.lte] = Number(maxAmount);
    }

    // 🚀 No include here
    const { count, rows } = await Transaction.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return res.status(200).json({
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      pageSize: limit,
      data: rows
    });

  } catch (error) {
    console.error('Filter Transactions Error:', error);

    return res.status(500).json({
      message: 'Server Error'
    });
  }
};