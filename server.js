const express = require('express');
const connectDB = require('./src/config/database');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cookieParser());
const authRouter = require('./src/routes/auth');
const employeeRouter = require('./src/routes/employee');
// const profileRouter = require('./src/routes/profile');
const healthCheckRouter = require('./src/routes/health');
const corsOptions = require('./src/config/cors');
const analyticsRouter = require('./src/routes/analytics');

app.use(cors(corsOptions));

app.use('/', healthCheckRouter);
app.use('/', authRouter);
app.use('/', employeeRouter);
app.use('/', analyticsRouter);
// app.use('/', profileRouter);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log('Database connected successfully...');
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database Connection failed!', err);
  });
