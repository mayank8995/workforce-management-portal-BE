const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;
const path = require('path');
// Filter to ONLY allow logs that have the request flag
const requestOnly = format((info) => {
  return info.isRequestLog ? info : false;
});

// Filter to IGNORE logs that have the request flag
const excludeRequests = format((info) => {
  return info.isRequestLog ? false : info;
});
// Define a clean, readable layout for the console output
const consoleFormat = printf(({ timestamp, level, message, ...metadata }) => {
  let metaString = Object.keys(metadata).length
    ? ` ${JSON.stringify(metadata)}`
    : '';
  return `[${timestamp}] ${level}: ${message}${metaString}`;
});

const logger = createLogger({
  // Fallback default log level if none is provided via environment variables
  level: process.env.LOG_LEVEL || 'info',
  transports: [
    // 1. Output stylized text to the terminal
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    }),
    // 2. Save structured production logs to a local file
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: combine(
        timestamp(),
        json() // Structured JSON layout is recommended for production archiving
      ),
    }),
    // 3. Separate critical runtime failures into an isolated log file
    new transports.File({
      filename: path.join(__dirname, '../../logs/errors.log'),
      level: 'error',
      format: combine(excludeRequests(), timestamp(), json()),
    }),
    new transports.File({
      filename: path.join(__dirname, '../../logs/requests.log'),
      level: 'info',
      format: combine(requestOnly(), timestamp(), json()),
    }),
  ],
});

module.exports = logger;
