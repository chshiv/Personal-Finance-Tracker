import rateLimit from "express-rate-limit";

// Auth: 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many authentication attempts. Try again after 15 minutes.",
  },
});

// Transactions: 100 requests per hour
export const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Transaction limit exceeded. Try again later.",
  },
});

// Analytics: 50 requests per hour
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Analytics limit exceeded. Try again later.",
  },
});