import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: false
  }
);

try {
  await sequelize.authenticate();
  console.log('PostgreSQL connected');
} catch (err) {
  console.error('DB Connection Error:', err);
}

export default sequelize;