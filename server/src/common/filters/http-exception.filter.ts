import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { logError } from '../../config/winston.config';
import { MongoServerError } from 'mongodb';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.requestId || 'unknown';

    // Handle HttpException (our custom exceptions)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const responseBody: any = {
        success: false,
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || exception.message,
        requestId,
      };

      // Add validation errors if present
      if (
        typeof exceptionResponse === 'object' &&
        (exceptionResponse as any).errors
      ) {
        responseBody.errors = (exceptionResponse as any).errors;
      }

      response.status(status).json(responseBody);
      return;
    }

    // Handle JWT errors
    if (exception instanceof JsonWebTokenError) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token',
        requestId,
      });
      return;
    }

    if (exception instanceof TokenExpiredError) {
      response.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Token expired',
        requestId,
      });
      return;
    }

    // Handle MongoDB duplicate key errors
    if (exception instanceof MongoServerError && exception.code === 11000) {
      const field = Object.keys(exception.keyPattern || {})[0] || 'field';
      response.status(HttpStatus.CONFLICT).json({
        success: false,
        message: `${field} already exists`,
        requestId,
      });
      return;
    }

    // Handle MongoDB validation errors
    if (
      exception &&
      typeof exception === 'object' &&
      'name' in exception &&
      exception.name === 'ValidationError' &&
      'errors' in exception
    ) {
      const mongooseError = exception as {
        errors: Record<string, { path: string; message: string }>;
      };
      const errors = Object.values(mongooseError.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Validation failed',
        errors,
        requestId,
      });
      return;
    }

    // Log unexpected errors
    logError('Unexpected error', exception, {
      requestId,
      url: request.url,
      method: request.method,
      ip: request.ip,
    });

    // Send generic error message
    const isDevelopment = process.env.NODE_ENV === 'development';

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: isDevelopment
        ? (exception as Error)?.message || 'Internal server error'
        : 'Internal server error',
      requestId,
      ...(isDevelopment &&
        exception instanceof Error && {
          stack: exception.stack,
          name: exception.name,
        }),
    });
  }
}
