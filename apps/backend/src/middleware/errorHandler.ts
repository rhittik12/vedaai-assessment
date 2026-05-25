import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

type HttpError = Error & { status?: number };

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof multer.MulterError) {
    response.status(400).json({ message: error.message });
    return;
  }

  const httpError = error as HttpError;
  const statusCode = httpError.status ?? 500;
  const message = httpError.message || 'Internal server error';

  response.status(statusCode).json({ message });
}
