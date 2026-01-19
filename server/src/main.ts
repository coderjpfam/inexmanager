import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { logInfo, logError } from './config/winston.config';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppConfig } from './config/app.config';
import { getCorsConfig, getHelmetConfig } from './config/env-specific.config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const appConfig = configService.get<AppConfig>('config.app')!;

    // CORS Configuration (environment-specific)
    const corsConfig = getCorsConfig(appConfig);
    app.enableCors(corsConfig);
    logInfo(
      `CORS enabled for origins: ${Array.isArray(corsConfig.origin) ? corsConfig.origin.join(', ') : 'all'}`,
    );

    // Helmet Security Headers (environment-specific)
    const helmetConfig = getHelmetConfig(appConfig);
    app.use(helmet(helmetConfig));
    logInfo('Helmet security headers enabled');

    // Global Validation Pipe (Zod)
    app.useGlobalPipes(
      new ZodValidationPipe({
        errorHttpStatusCode: 400,
      }),
    );
    logInfo('Zod validation enabled');

    // Global Prefix
    app.setGlobalPrefix('api/v1');
    logInfo('Global prefix set to: /api/v1');

    // Swagger Documentation
    if (appConfig.nodeEnv !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Income & Expense Manager API')
        .setDescription('API documentation for Income & Expense Manager')
        .setVersion('2.0.0')
        .addBearerAuth()
        .build();
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
      logInfo('Swagger documentation available at: /api/docs');
    }

    const port = appConfig.port;
    await app.listen(port);
    logInfo(`Application is running on: http://localhost:${port}`);
    logInfo(`Environment: ${appConfig.nodeEnv}`);
  } catch (error) {
    logError('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
