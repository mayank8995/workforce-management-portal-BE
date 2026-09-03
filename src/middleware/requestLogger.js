const logger = require('../logger/logger');

const requestLogger = async (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = `${Date.now() - start}ms`;
    logger.info('API Request', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      isRequestLog: true,
    });
  });
  next();
};

module.exports = requestLogger;
