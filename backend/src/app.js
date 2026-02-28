import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import { authLimiter, transactionLimiter, analyticsLimiter } from "./middlewares/rateLimiter.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import userRoutes from './routes/usersRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

dotenv.config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes   
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use("/api/transactions", transactionLimiter, transactionRoutes);
app.use("/api/analytics", analyticsLimiter, analyticsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.sync(); // create tables if not exist
    console.log('DB synced');
  } catch (err) {
    console.error('DB sync error', err);
  }
});