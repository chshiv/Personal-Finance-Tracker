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
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
const swaggerDocument = JSON.parse(fs.readFileSync('./src/swagger.json', 'utf8'));

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://personal-finance-tracker-h1rv.vercel.app",
  credentials: true
}));
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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