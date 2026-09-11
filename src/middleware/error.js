const logger = require('../logger/logger');
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  logger.error({
    message: err?.message,
    method: req?.method,
    url: req?.originalUrl,
    stack: err?.stack,
  });
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err?.message,
    code: err?.code,
  });
};

module.exports = { errorHandler };
