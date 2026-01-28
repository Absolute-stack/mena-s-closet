import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import logger from './middleware/logger.js';
import errorLogger from './middleware/errorLogger.js';
import connectDB from './config/connectDB.js';
import connectCloud from './config/connectCloud.js';

import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import cartRouter from './routes/cartRouter.js';
import orderRouter from './routes/orderRouter.js';

const PORT = process.env.PORT || 4000;
const app = express();

// ✅ REQUIRED for Railway / Render / Vercel
app.set('trust proxy', 1);

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

// Rate limiting
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Middleware
app.use(logger);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Compression
app.use(compression({ level: 6, threshold: 1024 }));

// ✅ Connect services BEFORE routes
connectDB();
connectCloud();

// Routes
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Health check
app.get('/api/health', (_, res) => res.json({ success: true, status: 'OK' }));

// 404
app.use((req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' }),
);

// Error logger
app.use(errorLogger);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;
