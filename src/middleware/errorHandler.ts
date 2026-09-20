import { Request, Response, NextFunction} from 'express'
import { AppError } from '../utils/errors'

// Catching requests that don't exist
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}