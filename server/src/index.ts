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

// Load environment variables
dotenv.config();

// Validate environment variables before starting server
try {
  validateEnv();
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  console.error('❌ Environment validation failed:');
  console.error(error instanceof Error ? error.message : error);
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
// Security headers (must be first)
app.use(helmet());

// Compression middleware (compress responses)
app.use(compression());

// Request logging (after security, before other middleware)
const isDevelopment = process.env.NODE_ENV === 'development';
app.use(
  morgan(isDevelopment ? 'dev' : 'combined', {
    skip: (req: Request) => {
      // Skip logging for health check endpoint in production
      return !isDevelopment && req.path === '/health';
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

// Routes
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
  console.log(`\n${signal} received, shutting down gracefully...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');

    // Close MongoDB connection
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      console.log('Graceful shutdown complete');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
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
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown(server, 'uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      console.error('Unhandled Rejection:', reason);
      gracefulShutdown(server, 'unhandledRejection');
    });
  } catch (error: unknown) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
