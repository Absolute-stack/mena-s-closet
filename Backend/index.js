import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import 'dotenv/config';
import logger from './middleware/logger.js';
import errorLogger from './middleware/errorLogger.js';
import connectDB from './config/connectDB.js';
import connectCloud from './config/connectCloud.js';
const PORT = process.env.PORT;
const app = express();

app.set('trust proxy', true);

// Log requests
app.use(logger);

// Compression for Optimizations
app.use(
  compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
    },
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Main Server MiddleWare Process
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Connect MongoDB Atlas & Cloudinary
connectDB();
connectCloud();

app.use(errorLogger);
app.listen(PORT, () => console.log(`Listening on Server PORT: ${PORT} ✅`));
