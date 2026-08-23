const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
// middleware for json parsing
app.use(express.json());
// middleware for cookies
app.use(cookieParser());
const appRoutes = require('./src/routes/health');
const authRouter = require('./src/routes/auth');
const employeeRouter = require('./src/routes/employee');
const profileRouter = require('./src/routes/profile');
const healthCheckRouter = require('./src/routes/health');

const corsOptions = {
  // origin: 'https://advance-dashboard.onrender.com',
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Access-Control-Allow-Origin',
  ],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use('/', healthCheckRouter);
app.use('/', authRouter);
app.use('/', employeeRouter);
app.use('/', profileRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Hybrid Backend is running on port ${PORT}`);
});
