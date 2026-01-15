import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { validateEnv } from './config/env';
import { errorHandler } from './utils/errors';
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

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
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

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
