import Transaction from '../models/transaction.js';
import redisClient from '../db/redis.js';
import { Op } from 'sequelize';

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
    const { amount, description, type } = req.body;

    /* =========================
       1️⃣ Check Missing Fields
    ========================= */

    const missingFields = [];

    if (amount === undefined) missingFields.push("amount");
    if (type === undefined) missingFields.push("type");
    if (description === undefined) missingFields.push("description");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `${missingFields.join(" and ")} ${
          missingFields.length > 1 ? "are" : "is"
        } missing`,
      });
    }

     /* =========================
       2️⃣ Validate Amount
    ========================= */

    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be a number greater than 0",
      });
    }

    /* =========================
       3️⃣ Validate Type
    ========================= */

    const allowedTypes = ["income", "expense"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Type must be either 'income' or 'expense'",
      });
    }

    /* =========================
       4️⃣ Validate Description
    ========================= */

    if (typeof description !== "string" || description.trim() === "") {
      return res.status(400).json({
        message: "Description must be a non-empty string",
      });
    }

     /* =========================
       5️⃣ Create Transaction
    ========================= */

    const targetUserId = role === "admin" && userId ? userId : id;

    const transaction = await Transaction.create({
      amount,
      description,
      type,
      categoryId: categoryId || null,
      userId: targetUserId,
    });

    // Invalidate analytics cache
    await redisClient.del(`analytics:${targetUserId}`);
    await redisClient.del(`analytics:admin`);

    res.status(201).json(transaction);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   PUT /api/transactions/:id
========================= */
export const updateTransaction = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Role & Ownership Check
    if (role !== 'admin' && transaction.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Allowed Fields
    const allowedFields = ['amount', 'description', 'type', 'categoryId'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Validate at least one field
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Field Validations
    if (updates.amount !== undefined) {
      if (typeof updates.amount !== 'number' || updates.amount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }
    }

    if (updates.type !== undefined) {
      const allowedTypes = ['income', 'expense'];
      if (!allowedTypes.includes(updates.type)) {
        return res.status(400).json({ message: 'Invalid transaction type' });
      }
    }

    // Optional: Validate category existence
    if (updates.categoryId !== undefined) {
      const category = await Category.findByPk(updates.categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid categoryId' });
      }
    }

    await transaction.update(updates);

    // Cache Invalidation
    await redisClient.del(`analytics:${transaction.userId}`);
    await redisClient.del(`analytics:admin`);

    return res.json({
      message: 'Transaction updated successfully',
      transaction
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
    if (!transaction) return res.status(404).json({ message: 'Not found' });

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
