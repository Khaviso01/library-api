import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { authors, books } from '../data/store';
import { validateBook } from '../middleware/validate';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { Book } from '../models/Book';

const router = Router();

// Helper function to find a book by its ID or throw a 404 NotFoundError if it does not exist
function findBookOrFail(id: string): Book {
  const book = books.find((b) => b.id === id);
  if (!book) {
    throw new NotFoundError(`Book with id "${id}" not found`);
  }
  return book;
}

// Confirms authorId references a real author; used on book create/update
function assertAuthorExists(authorId: string): void {
  const exists = authors.some((a) => a.id === authorId);
  if (!exists) {
    throw new ValidationError(`authorId "${authorId}" does not reference an existing author`);
  }
}

// Duplicate check = same title by the same author (excluding current book during updates)
function findDuplicate(title: string, authorId: string, excludeId?: string): Book | undefined {
  return books.find(
    (b) =>
      b.id !== excludeId &&
      b.authorId === authorId &&
      b.title.trim().toLowerCase() === title.trim().toLowerCase()
  );
}

// GET /books - retrieve all books with optional query filtering, sorting, and pagination
router.get('/', (req: Request, res: Response) => {
  let result = [...books];
  const { title, authorId, year, sort, order, page, limit } = req.query;

  // Filter books by title search query if provided
  if (typeof title === 'string' && title.trim()) {
    const q = title.toLowerCase();
    result = result.filter((b) => b.title.toLowerCase().includes(q));
  }
  
  // Filter books by a specific author ID if provided
  if (typeof authorId === 'string' && authorId.trim()) {
    result = result.filter((b) => b.authorId === authorId);
  }
  
  // Filter books by publication year if provided and valid
  if (year !== undefined && !Number.isNaN(Number(year))) {
    result = result.filter((b) => b.year === Number(year));
  }

  // Sort books by specified property (title, year, createdAt) and direction (asc/desc)
  if (sort === 'title' || sort === 'year' || sort === 'createdAt') {
    const dir = order === 'desc' ? -1 : 1;
    result.sort((a: any, b: any) => {
      if (a[sort] === undefined) return 1;
      if (b[sort] === undefined) return -1;
      return a[sort] > b[sort] ? dir : a[sort] < b[sort] ? -dir : 0;
    });
  }

  // Handle pagination calculations and return paginated results if page or limit parameters are passed
  const total = result.length;
  if (page || limit) {
    const pageNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const limitNum = Math.max(parseInt(String(limit), 10) || 10, 1);
    const start = (pageNum - 1) * limitNum;
    result = result.slice(start, start + limitNum);
    res.status(200).json({ total, page: pageNum, limit: limitNum, data: result });
    return;
  }

  res.status(200).json({ total, data: result });
});

// retrieve a single book by its unique ID
router.get('/:id', (req: Request, res: Response) => {
  const book = findBookOrFail(String(req.params.id));
  res.status(200).json(book);
});

// create and store a new book after verifying author existence and checking for duplicate titles
router.post('/', validateBook, (req: Request, res: Response) => {
  const { title, authorId, year, genre, isbn } = req.body;

  assertAuthorExists(authorId);

  if (findDuplicate(title, authorId)) {
    throw new ConflictError('A book with this title already exists for this author');
  }

  const now = new Date().toISOString();
  const newBook: Book = {
    id: randomUUID(),
    title: title.trim(),
    authorId,
    year,
    genre,
    isbn,
    createdAt: now,
    updatedAt: now,
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// update an existing book's details by ID with validation and conflict checks
router.put('/:id', validateBook, (req: Request, res: Response) => {
  const book = findBookOrFail(String(req.params.id));
  const { title, authorId, year, genre, isbn } = req.body;

  if (authorId !== undefined) {
    assertAuthorExists(authorId);
  }

  const nextTitle = title !== undefined ? title.trim() : book.title;
  const nextAuthorId = authorId !== undefined ? authorId : book.authorId;

  if (findDuplicate(nextTitle, nextAuthorId, book.id)) {
    throw new ConflictError('A book with this title already exists for this author');
  }

  book.title = nextTitle;
  book.authorId = nextAuthorId;
  if (year !== undefined) book.year = year;
  if (genre !== undefined) book.genre = genre;
  if (isbn !== undefined) book.isbn = isbn;
  book.updatedAt = new Date().toISOString();

  res.status(200).json(book);
});

//delete a book by its ID and return a 204 no-content response
router.delete('/:id', (req: Request, res: Response) => {
  const book = findBookOrFail(String(req.params.id));
  const index = books.findIndex((b) => b.id === book.id);
  books.splice(index, 1);
  res.status(204).send();
});

export default router;