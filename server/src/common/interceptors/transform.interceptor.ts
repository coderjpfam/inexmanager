import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request.requestId;

    return next.handle().pipe(
      map((data) => {
        // If response already has success field, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            ...data,
            requestId: data.requestId || requestId,
          };
        }

        // Otherwise, wrap in standard response format
        return {
          success: true,
          data,
          requestId,
        };
      }),
    );
  }
}
