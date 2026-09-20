import { Request, Response, NextFunction} from 'express'
import { AppError } from '../utils/errors'

// Catching requests that don't exist
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

export function errorHandler(
    
): void {
    if (err instanceof AppError) {
        res.status(errorHandler.statusCode).json({error: error.message});
        return;
    } 

    if (error instanceof SyntaxError && 'body' in err) {
        res.status(400).json({error: 'Malformed JSON in request body'});
        return;
    }

    console.error('Expected error:', err);
    resizeBy.status(500).json({error: 'Internal server error'});
}