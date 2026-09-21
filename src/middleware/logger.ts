import { Request, Response, NextFunction } from 'express';

// logging incoming requests and their corresponding responses with timestamps and duration
export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Logs incoming requests received 
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  // Calculating how long request takes to process and finish
  res.on('finish', () => {
    const duration = Date.now() - start;

    // Logs final HTTP status code
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}
