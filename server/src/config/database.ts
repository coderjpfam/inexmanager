import mongoose from 'mongoose';
import { logError, logInfo } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    // MongoDB connection options for production-ready setup
    const connectionOptions: mongoose.ConnectOptions = {
      // Connection Pool Settings
      maxPoolSize: 10, // Maximum number of connections in the pool (default: 100)
      minPoolSize: 2, // Minimum number of connections in the pool (default: 0)
      
      // Timeout Settings
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server before timing out (default: 30000)
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take before timing out (default: 0 = no timeout)
      connectTimeoutMS: 10000, // How long to wait for initial connection (default: 30000)
      
      // Retry Settings
      retryWrites: true, // Retry write operations on network errors (default: true)
      retryReads: true, // Retry read operations on network errors (default: true)
      
      // Buffer Settings
      bufferMaxEntries: 0, // Disable mongoose buffering (fail fast if not connected)
      bufferCommands: false, // Disable mongoose buffering (fail fast if not connected)
      
      // Heartbeat Settings
      heartbeatFrequencyMS: 10000, // How often to check server status (default: 10000)
      
      // Other Settings
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity (default: null)
    };

    await mongoose.connect(mongoURI, connectionOptions);
    logInfo('MongoDB connected successfully');
    logInfo(`Connection pool: ${connectionOptions.minPoolSize}-${connectionOptions.maxPoolSize} connections`);
  } catch (error: unknown) {
    logError('MongoDB connection error', error);
    throw error;
  }
};
