import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', authMiddleware(['admin', 'user', 'read-only']), getCategories);

router.post('/', authMiddleware('admin'), createCategory);
router.put('/:id', authMiddleware('admin'), updateCategory);
router.delete('/:id', authMiddleware('admin'), deleteCategory);

export default router;