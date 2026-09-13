const rateLimit = require('express-rate-limit');
const base = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
};
const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: { error: 'Too many requests. Please slow down.' },
});

const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 8,
  skipSuccessfulRequests: true,
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
});

const aiRateLimiter = rateLimit({
  ...base,
  windowMs: 60_000,
  limit: 10,
  message: { error: 'Too many requests. Please slow down.' },
});

module.exports = { globalLimiter, aiRateLimiter, authLimiter };
