/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';

import winston, { format } from 'winston';
import 'winston-daily-rotate-file';

import type { Request, Response, NextFunction } from 'express';
import type { Logger } from 'winston';

const LOG_DIR = {
  ERROR_FILE: 'log/error',
  INFO_FILE: 'log/info',
};

const LOG_LEVEL = {
  INFO: 'info',
  DEBUG: 'debug',
  VERBOSE: 'verbose',
  WARN: 'warn',
  ERROR: 'error',
};

// Ensure log directories exist
if (!fs.existsSync(LOG_DIR.ERROR_FILE)) {
  fs.mkdirSync(LOG_DIR.ERROR_FILE, { recursive: true });
}

if (!fs.existsSync(LOG_DIR.INFO_FILE)) {
  fs.mkdirSync(LOG_DIR.INFO_FILE, { recursive: true });
}

// Custom filter for error logs
const errorOnlyFilter = format((info) => {
  return info.level === LOG_LEVEL.ERROR ? info : false;
});

// Custom filter for info logs (exclude error logs)
const infoOnlyFilter = format((info) => {
  return info.level !== LOG_LEVEL.ERROR ? info : false;
});

// Winston transports
const winstonTransports = [
  // Console transport for all logs
  new winston.transports.Console({
    format: format.combine(format.colorize(), format.simple()),
    level: LOG_LEVEL.DEBUG,
  }),

  // Daily rotate file for info logs (excluding error logs)
  new winston.transports.DailyRotateFile({
    format: format.combine(format.timestamp(), infoOnlyFilter(), format.json()),
    maxFiles: '7d',
    level: LOG_LEVEL.INFO,
    dirname: LOG_DIR.INFO_FILE,
    datePattern: 'YYYY-MM-DD',
    filename: '%DATE%-info.log',
  }),

  // Daily rotate file for error logs
  new winston.transports.DailyRotateFile({
    format: format.combine(format.timestamp(), errorOnlyFilter(), format.json()),
    maxFiles: '100d',
    level: LOG_LEVEL.ERROR,
    dirname: LOG_DIR.ERROR_FILE,
    datePattern: 'YYYY-MM-DD',
    filename: '%DATE%-error.log',
  }),
];

// Create the logger instance
const logger: Logger = winston.createLogger({
  level: LOG_LEVEL.DEBUG,
  transports: winstonTransports,
  format: format.combine(format.errors({ stack: true }), format.timestamp(), format.json()),
});

logger.stream({
  write: (message: string) => {
    logger.error(message.trim());
  },
});

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
    const tenantId = (req as any).tenant_id || req.headers['x-tenant-id'] || '-';
    const logMsg = `${tenantId} ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    if (res.statusCode >= 400) {
      logger.error(logMsg);
    } else {
      logger.info(logMsg);
    }
  });
  next();
}

export default logger;
