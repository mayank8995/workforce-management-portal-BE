const rateLimit = require('express-rate-limit');
const base = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
};
const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: { message: 'Too many requests. Please slow down.', success: false },
});

const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  message: {
    message: 'Too many attempts. Try again in 15 minutes.',
    success: false,
  },
});

const aiRateLimiter = rateLimit({
  ...base,
  windowMs: 60_000,
  limit: 10,
  message: { message: 'Too many requests. Please slow down.', success: false },
});

module.exports = { globalLimiter, aiRateLimiter, authLimiter };
