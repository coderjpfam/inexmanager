import { registerAs } from '@nestjs/config';
import { AllConfig, AppConfig, JwtConfig, EmailConfig, DatabaseConfig } from './app.config';

export default registerAs('config', (): AllConfig => {
  return {
    app: {
      port: parseInt(process.env.PORT || '3000', 10),
      nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      clientUrl: process.env.CLIENT_URL || 'http://localhost:8081',
    },
    jwt: {
      secret: process.env.JWT_SECRET || '',
      refreshSecret: process.env.JWT_REFRESH_SECRET || '',
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    email: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
      from: process.env.EMAIL_FROM || '',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@inexmanager.com',
      companyAddress:
        process.env.COMPANY_ADDRESS || '123 Finance Street, Money City, FC 12345',
      facebookLink: process.env.FACEBOOK_LINK || '#',
      twitterLink: process.env.TWITTER_LINK || '#',
      instagramLink: process.env.INSTAGRAM_LINK || '#',
    },
    database: {
      uri: process.env.MONGODB_URI || '',
    },
  };
});
