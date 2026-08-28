const corsOptions = {
  // origin: 'https://advance-dashboard.onrender.com',
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
};

module.exports = corsOptions;
