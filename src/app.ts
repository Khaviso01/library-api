import express from 'express'
import { logger } from './middleware/logger'
import {notFoundHandler, errorHandler } from './middleware/errorHandler'
import authorsRouter from './routes/authors';
import booksRouter from './routes/books';

const app = express();

app.use(express.json());
app.use(logger);

app.get('/', (_req, res) => {
    res.status(200).json({
        message: 'Library is running',
        resources: ['/authors', '/books'],
    })
});

app.use('/authors', authorsRouter);
app.use('/books', booksRouter);

// 404 for unknown routes
app.use(notFoundHandler);
app.use(errorHandler);

export default app 