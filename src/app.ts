import express from 'express';
import { logger } from './middleware/logger';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';
import authorsRouter from './routes/authors';
import booksRouter from './routes/books';

// Initialize an Express application instance
const app = express();

// Enable parsing of incoming JSON request bodies
app.use(express.json());
// Register the logging middleware to record incoming HTTP requests and durations
app.use(logger);

// Define a root health-check endpoint confirming the API is active and listing available resources
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Library API is running',
    resources: ['/authors', '/books'],
  });
});

// Mount the author and book routers onto their respective paths
app.use('/authors', authorsRouter);
app.use('/books', booksRouter);

// Catch unhandled routes with the 404 handler, then pass any errors to the centralized error handler
app.use(notFoundHandler);
app.use(errorHandler);

// Export the configured express app instance for use in server startup and testing
export default app;
