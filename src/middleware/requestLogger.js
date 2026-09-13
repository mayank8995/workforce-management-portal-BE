const logger = require('../logger/logger');

const requestLogger = async (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = `${Date.now() - start}ms`;
    logger.info('API Request', {
      duration,
      url: req.originalUrl,
      method: req.method,
      status: res.statusCode,
      ip: req.ip,
      isRequestLog: true,
    });
  });
  next();
};

module.exports = requestLogger;
