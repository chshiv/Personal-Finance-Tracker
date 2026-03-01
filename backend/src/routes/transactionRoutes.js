import express from 'express';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { filterTransactions } from '../controllers/transactionController.js';

const router = express.Router();

// Accessible to all roles (admin, user, read-only)
router.get('/', authMiddleware(['admin', 'user', 'read-only']), getTransactions);
router.post('/', authMiddleware(['admin','user']), createTransaction);
router.put('/:id', authMiddleware(['admin','user']), updateTransaction);
router.delete('/:id', authMiddleware(['admin','user']), deleteTransaction);
router.get('/filter', authMiddleware(['admin', 'user', 'read-only']), filterTransactions);

export default router;