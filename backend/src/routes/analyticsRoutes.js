import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authMiddleware(['admin','user','read-only']), getAnalytics);

export default router;