import { AppConfig } from './app.config';

/**
 * Get CORS configuration based on environment
 */
export const getCorsConfig = (appConfig: AppConfig) => {
  const isProduction = appConfig.nodeEnv === 'production';

  return {
    origin: isProduction
      ? appConfig.clientUrl.split(',').map((url) => url.trim())
      : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
};

/**
 * Get Helmet configuration based on environment
 */
export const getHelmetConfig = (appConfig: AppConfig) => {
  const isProduction = appConfig.nodeEnv === 'production';

  return {
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        }
      : false, // Disable CSP in development for easier debugging
  };
};
