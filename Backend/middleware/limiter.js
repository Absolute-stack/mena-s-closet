import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,

  skipFailedRequests: false,

  // FIX: Use express-rate-limit’s built-in IPv4/IPv6 safe key generator
  keyGenerator: ipKeyGenerator,
});

export default loginLimiter;
