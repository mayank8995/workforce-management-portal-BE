const express = require('express');
const connectDB = require('./src/config/database');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('./src/events/activityLog.listener');
require('./src/events/realtime.listener');

const authRouter = require('./src/routes/auth');
const employeeRouter = require('./src/routes/employee');
const healthCheckRouter = require('./src/routes/health');
const corsOptions = require('./src/config/cors');
const analyticsRouter = require('./src/routes/analytics');
const aiRouter = require('./src/routes/ai');
const logger = require('./src/logger/logger');
const requestLogger = require('./src/middleware/requestLogger');
const { loadRoles } = require('./src/utils/roleCache');
const { errorHandler } = require('./src/middleware/error');
const {
  globalLimiter,
  aiRateLimiter,
  authLimiter,
} = require('./src/utils/rateLimiter');
const uploadRouter = require('./src/routes/upload');
const { initSocket } = require('./src/socket');

const app = express();

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use('/', healthCheckRouter);

app.use(['/guest', '/login', '/logout', '/signup'], authLimiter);
app.use('/ai', aiRateLimiter);
app.use(globalLimiter);

app.use('/', authRouter);
app.use('/', employeeRouter);
app.use('/', analyticsRouter);
app.use('/', aiRouter);
app.use('/', uploadRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3500;

connectDB()
  .then(async () => {
    logger.info('Database connected successfully...');
    await loadRoles();
    logger.info('Roles cached');
    const server = app.listen(PORT, () => {
      logger.info(`server is running on port ${PORT}`);
    });
    initSocket(server);
  })
  .catch((err) => {
    logger.error('Database Connection failed!', err);
    process.exit(1);
  });
