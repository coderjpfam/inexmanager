import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server } from 'http';
import { connectDatabase } from './config/database';
import { validateEnv } from './config/env';
import { errorHandler } from './utils/errors';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/authRoutes';
import { requestIdMiddleware } from './middleware/requestId';
import { sanitizeInput } from './middleware/sanitize';
import { setCsrfToken, csrfProtection } from './middleware/csrf';
import { logError, logInfo, logWarning } from './utils/logger';

// Load environment variables
dotenv.config();

// Validate environment variables before starting server
try {
  validateEnv();
  logInfo('Environment variables validated successfully');
} catch (error) {
  logError('Environment validation failed', error);
  process.exit(1);
}

const app: Application = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:8081'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 86400, // 24 hours - how long the results of a preflight request can be cached
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Middleware
// Request ID middleware (must be first to track all requests)
app.use(requestIdMiddleware);

// Input sanitization (early in the chain, before parsing)
app.use(sanitizeInput);

// CSRF token generation (for GET requests)
app.use(setCsrfToken);

// Security headers (configured for API server)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for Swagger UI
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for API server (not needed)
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny', // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME type sniffing
    xssFilter: true, // Enable XSS filter
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
  })
);

// Compression middleware (compress responses)
app.use(compression());

// Request logging (after security, before other middleware)
// Enhanced morgan format with request ID, user ID, and IP
const isDevelopment = process.env.NODE_ENV === 'development';

// Custom tokens for enhanced logging
morgan.token('request-id', (req: Request & { requestId?: string }) => req.requestId || '-');
morgan.token('user-id', (req: Request & { user?: { userId: string } }) => req.user?.userId || 'anonymous');
morgan.token('ip', (req: Request) => req.ip || req.socket.remoteAddress || '-');

// Custom format with enhanced context
const logFormat = isDevelopment
  ? ':method :url :status :response-time ms - :request-id - :user-id - :ip'
  : ':method :url :status :response-time ms :remote-addr :user-id :request-id';

app.use(
  morgan(logFormat, {
    skip: (req: Request) => {
      // Skip logging for health check endpoint in production
      return !isDevelopment && req.path === '/health';
    },
    stream: {
      write: (message: string) => {
        logInfo(message.trim());
      },
    },
  })
);

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded payload size to 10MB

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Income & Expense Manager API Documentation',
}));

// Health check route
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running and healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected, connecting, disconnecting]
 *                   example: connected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-01T00:00:00.000Z
 *       503:
 *         description: Server is running but database is disconnected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Server is running but database is disconnected
 *                 database:
 *                   type: string
 *                   example: disconnected
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', async (req: Request, res: Response) => {
  // Check database connection status
  const dbReadyState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const dbStatus = dbStates[dbReadyState as keyof typeof dbStates] || 'unknown';
  const isDbConnected = dbReadyState === 1;

  const healthStatus = {
    success: isDbConnected,
    message: isDbConnected ? 'Server is running' : 'Server is running but database is disconnected',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  };

  // Return 503 if database is not connected, 200 if everything is healthy
  const statusCode = isDbConnected ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// API Versioning - Version 1
app.use('/api/v1/auth', authRoutes);

// Legacy route support (redirect to v1)
app.use('/api/auth', authRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last middleware)
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = (server: Server, signal: string): void => {
  logInfo(`${signal} received, shutting down gracefully...`);

  // Stop accepting new connections
  server.close(() => {
    logInfo('HTTP server closed');

    // Close MongoDB connection
    mongoose.connection.close(false, () => {
      logInfo('MongoDB connection closed');
      logInfo('Graceful shutdown complete');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logError('Could not close connections in time, forcefully shutting down');
    mongoose.connection.close(false);
    process.exit(1);
  }, 10000);
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening and capture server instance
    const server: Server = app.listen(PORT, () => {
      logInfo(`Server is running on port ${PORT}`);
      logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logInfo(`API Documentation: http://localhost:${PORT}/api-docs`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logError('Uncaught Exception', error);
      gracefulShutdown(server, 'uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logError('Unhandled Rejection', reason);
      gracefulShutdown(server, 'unhandledRejection');
    });
  } catch (error: unknown) {
    logError('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
