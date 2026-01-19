import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

const logDir = path.join(process.cwd(), 'logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  }),
);

// Create daily rotate file transport for all logs
const allLogsTransport = new DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
});

// Create daily rotate file transport for error logs
const errorLogsTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
});

// Create Winston logger instance
export const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'inexmanager-server' },
  transports: [
    allLogsTransport,
    errorLogsTransport,
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

// Helper functions
export const logInfo = (message: string, meta?: any) => {
  winstonLogger.info(message, meta);
};

export const logError = (message: string, error?: any, meta?: any) => {
  winstonLogger.error(message, { error, ...meta });
};

export const logWarning = (message: string, meta?: any) => {
  winstonLogger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  winstonLogger.debug(message, meta);
};
