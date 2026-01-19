import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { logInfo, logError } from '../../config/winston.config';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const user = (request as any).user;
    const requestId = request.requestId || 'unknown';
    const startTime = Date.now();

    // Log request
    logInfo(`${method} ${url}`, {
      ip,
      userId: user?.userId,
      requestId,
      userAgent: request.headers['user-agent'],
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          logInfo(`${method} ${url} - ${duration}ms`, {
            ip,
            userId: user?.userId,
            requestId,
            statusCode: context.switchToHttp().getResponse().statusCode,
            duration,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          logError(`${method} ${url} - ${duration}ms`, error, {
            ip,
            userId: user?.userId,
            requestId,
            duration,
          });
        },
      }),
    );
  }
}
