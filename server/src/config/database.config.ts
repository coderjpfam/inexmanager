import { MongooseModuleOptions } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './app.config';
import { logInfo, logError, logWarning } from './winston.config';

export const getDatabaseConfig = (configService: ConfigService): MongooseModuleOptions => {
  const dbConfig = configService.get<DatabaseConfig>('config.database')!;

  if (!dbConfig.uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  return {
    uri: dbConfig.uri,
    // Connection Pool Settings
    maxPoolSize: 10,
    minPoolSize: 2,
    // Timeout Settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    // Retry Settings
    retryWrites: true,
    retryReads: true,
    // Buffer Settings
    bufferMaxEntries: 0,
    bufferCommands: false,
    // Heartbeat Settings
    heartbeatFrequencyMS: 10000,
    // Other Settings
    maxIdleTimeMS: 30000,
  };
};

/**
 * Connection factory to set up MongoDB connection event handlers
 */
export const connectionFactory = (connection: Connection): Connection => {
  connection.on('connected', () => {
    logInfo('MongoDB connected successfully');
    logInfo('Connection pool: 2-10 connections');
  });

  connection.on('error', (err) => {
    logError('MongoDB connection error', err);
  });

  connection.on('disconnected', () => {
    logWarning('MongoDB disconnected');
  });

  connection.on('reconnected', () => {
    logInfo('MongoDB reconnected');
  });

  // Handle process termination
  process.on('SIGINT', async () => {
    await connection.close();
    logInfo('MongoDB connection closed through app termination');
    process.exit(0);
  });

  return connection;
};
