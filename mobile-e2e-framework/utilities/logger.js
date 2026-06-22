const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const config = require('../config/config');

const logDir = config.paths.logs;
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `${timestamp} [${level}] ${message} - ${stack}`
        : `${timestamp} [${level}] ${message}`;
    })
  ),
  transports: [
    new transports.Console({ level: 'info' }),
    new transports.File({ filename: path.join(logDir, 'execution.log'), level: 'debug' })
  ]
});

module.exports = logger;
