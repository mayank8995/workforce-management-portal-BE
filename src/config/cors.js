require('dotenv').config();

// Comma-separated list, e.g. CORS_ORIGIN=http://localhost:5173 for local dev.
const origin = (
  process.env.CORS_ORIGIN || 'https://advance-dashboard.onrender.com'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin,
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
};

module.exports = corsOptions;
