const express = require('express');
const connectDB = require('./src/config/database');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cookieParser());
const authRouter = require('./src/routes/auth');
const employeeRouter = require('./src/routes/employee');
const healthCheckRouter = require('./src/routes/health');
const corsOptions = require('./src/config/cors');
const analyticsRouter = require('./src/routes/analytics');
const logger = require('./src/logger/logger');
const requestLogger = require('./src/middleware/requestLogger');
app.use(cors(corsOptions));
app.use(requestLogger);
app.use('/', healthCheckRouter);
app.use('/', authRouter);
app.use('/', employeeRouter);
app.use('/', analyticsRouter);

const PORT = process.env.PORT || 3500;

connectDB()
  .then(() => {
    logger.info('Database connected successfully...');
    app.listen(PORT, () => {
      logger.info(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.alert('Database Connection failed!', err);
  });
