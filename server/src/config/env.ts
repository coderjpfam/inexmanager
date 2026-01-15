/**
 * Environment Variable Validation
 * Validates all required environment variables on server startup
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_FROM',
  'CLIENT_URL',
] as const;

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'JWT_ACCESS_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'SUPPORT_EMAIL',
  'COMPANY_ADDRESS',
  'FACEBOOK_LINK',
  'TWITTER_LINK',
  'INSTAGRAM_LINK',
] as const;

/**
 * Validate that all required environment variables are set
 */
export const validateEnv = (): void => {
  const missing: string[] = [];
  
  // Check required variables
  for (const key of requiredEnvVars) {
    if (!process.env[key] || process.env[key]?.trim() === '') {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file or environment configuration.`
    );
  }
  
  // Validate JWT secrets are different
  if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      'JWT_SECRET and JWT_REFRESH_SECRET must be different for security reasons.'
    );
  }
  
  // Validate JWT secrets are strong enough (minimum 32 characters)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security. ' +
      'Generate using: openssl rand -base64 32'
    );
  }
  
  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error(
      'JWT_REFRESH_SECRET must be at least 32 characters long for security. ' +
      'Generate using: openssl rand -base64 32'
    );
  }
  
  // Validate email port is a number
  const emailPort = process.env.EMAIL_PORT;
  if (emailPort) {
    const portNum = parseInt(emailPort, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      throw new Error(
        `EMAIL_PORT must be a valid port number (1-65535), got: ${emailPort}`
      );
    }
  }
  
  // Validate PORT is a number if provided
  const port = process.env.PORT;
  if (port) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      throw new Error(
        `PORT must be a valid port number (1-65535), got: ${port}`
      );
    }
  }
  
  // Validate CLIENT_URL is a valid URL (can be comma-separated for multiple origins)
  const clientUrl = process.env.CLIENT_URL;
  if (clientUrl) {
    const urls = clientUrl.split(',').map((url) => url.trim());
    for (const url of urls) {
      try {
        new URL(url);
      } catch {
        throw new Error(
          `CLIENT_URL must contain valid URL(s) (comma-separated for multiple), got: ${url}`
        );
      }
    }
  }
  
  // Validate email format
  const emailFrom = process.env.EMAIL_FROM;
  if (emailFrom) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailFrom)) {
      throw new Error(
        `EMAIL_FROM must be a valid email address, got: ${emailFrom}`
      );
    }
  }
  
  // Validate NODE_ENV if provided
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
    console.warn(
      `Warning: NODE_ENV should be 'development', 'production', or 'test', got: ${nodeEnv}`
    );
  }
};

/**
 * Get validated environment variable (type-safe)
 */
export const getEnv = (key: typeof requiredEnvVars[number] | typeof optionalEnvVars[number]): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

/**
 * Get optional environment variable with default
 */
export const getEnvOptional = (
  key: typeof optionalEnvVars[number],
  defaultValue: string
): string => {
  return process.env[key] || defaultValue;
};
