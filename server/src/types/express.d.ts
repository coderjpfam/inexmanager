import 'express';

declare namespace Express {
  interface Request {
    requestId?: string;
  }
}
