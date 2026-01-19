import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    statusCode: HttpStatus,
    message: string,
    public readonly isOperational = true,
  ) {
    super(message, statusCode);
    this.name = 'AppException';
  }
}

export class ValidationException extends AppException {
  constructor(
    message: string,
    public readonly errors?: Array<{ field?: string; message: string }>,
  ) {
    super(HttpStatus.BAD_REQUEST, message);
    this.name = 'ValidationException';
  }
}

export class AuthenticationException extends AppException {
  constructor(message: string = 'Authentication failed') {
    super(HttpStatus.UNAUTHORIZED, message);
    this.name = 'AuthenticationException';
  }
}

export class AuthorizationException extends AppException {
  constructor(message: string = 'Access denied') {
    super(HttpStatus.FORBIDDEN, message);
    this.name = 'AuthorizationException';
  }
}

export class NotFoundException extends AppException {
  constructor(message: string = 'Resource not found') {
    super(HttpStatus.NOT_FOUND, message);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends AppException {
  constructor(message: string) {
    super(HttpStatus.CONFLICT, message);
    this.name = 'ConflictException';
  }
}

export class EmailSendException extends AppException {
  constructor(message: string = 'Failed to send email') {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
    this.name = 'EmailSendException';
  }
}

export class EmailTemplateException extends AppException {
  constructor(message: string = 'Failed to load email template') {
    super(HttpStatus.INTERNAL_SERVER_ERROR, message);
    this.name = 'EmailTemplateException';
  }
}
