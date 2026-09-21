import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Malformed JSON in request body' });
    return;
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Internal server error' });
}