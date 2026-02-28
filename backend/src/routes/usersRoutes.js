import express from 'express';
import { getAllUsers } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Admin only
router.get('/', authMiddleware('admin'), getAllUsers);

export default router;