import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

// Catches requests to routes that don't exist at all
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

// Global error handling middleware for operational errors
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // Retaining the next function parameter required by express
  next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Ensuring error is not caused by invalid JSON
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON in request body' });
    return;
  }

  // Logs any other unexpected error to console and responses with internal server
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
}
