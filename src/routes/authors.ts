import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { authors, books } from '../data/store';
import { validateAuthor } from '../middleware/validate';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Author } from '../models/Author';

const router = Router();

function getAuthorById(id: string): Author {
    const author = authors.find((a) => a.id === id);
    if (!author) {
        throw new NotFoundError(`Author with id "${id}" not found`);
    }
    return author
}