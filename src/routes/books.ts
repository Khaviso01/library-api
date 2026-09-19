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

function assertAuthorExists(authorId: string): void {
  const exists = authors.some((a) => a.id === authorId);
  if (!exists) {
    throw new ValidationError(`authorId "${authorId}" does not reference an existing author`);
  }
}

function findDuplicate(title: string, authorId: string, excludeId?: string): Book | undefined {
  return books.find(
    (b) =>
      b.id !== excludeId &&
      b.authorId === authorId &&
      b.title.trim().toLowerCase() === title.trim().toLowerCase()
  );
}