import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { authors, books } from '../data/store';
import { validateBook } from '../middleware/validate';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { Book } from '../models/Book';

const router = Router();

function findBookOrFail(id: string): Book {
  const book = books.find((b) => b.id === id);
  if (!book) {
    throw new NotFoundError(`Book with id "${id}" not found`);
  }
  return book;
}