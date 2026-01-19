import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import {
  getDatabaseConfig,
  connectionFactory,
} from './config/database.config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TokenCleanupService } from './common/services/token-cleanup.service';
import { Token, TokenSchema } from './schemas/token.schema';
import configuration from './config/configuration';
import { validateEnv } from './config/env.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validate: () => {
        validateEnv();
        return true;
      },
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
      connectionFactory,
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'medium',
        ttl: 300000, // 5 minutes
        limit: 200, // 200 requests per 5 minutes
      },
      {
        name: 'long',
        ttl: 900000, // 15 minutes
        limit: 500, // 500 requests per 15 minutes
      },
    ]),

    // Scheduled Tasks
    ScheduleModule.forRoot(),

    // Token model for cleanup service
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),

    // Feature Modules
    AuthModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    TokenCleanupService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
