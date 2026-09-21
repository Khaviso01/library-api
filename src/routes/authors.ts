import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { authors, books } from '../data/store';
import { validateAuthor } from '../middleware/validate';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Author } from '../models/Author';

const router = Router();

// Helper function to find an author by ID or throw a 404 NotFoundError if they do not exist
function findAuthorOrFail(id: string): Author {
  const author = authors.find((a) => a.id === id);
  if (!author) {
    throw new NotFoundError(`Author with id "${id}" not found`);
  }
  return author;
}

// retrieve all authors with optional query filtering, sorting, and pagination
router.get('/', (req: Request, res: Response) => {
  let result = [...authors];
  const { name, sort, order, page, limit } = req.query;

  // Filter authors by name if a search query is provided
  if (typeof name === 'string' && name.trim()) {
    const q = name.toLowerCase();
    result = result.filter((a) => a.name.toLowerCase().includes(q));
  }

  // Sort authors by specified property (name, birthYear, createdAt) and direction (asc/desc)
  if (sort === 'name' || sort === 'birthYear' || sort === 'createdAt') {
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

// retrieve a single author by their unique ID
router.get('/:id', (req: Request, res: Response) => {
  const author = findAuthorOrFail(String(req.params.id));
  res.status(200).json(author);
});

// retrieve all books written by a specific author
router.get('/:id/books', (req: Request, res: Response) => {
  const author = findAuthorOrFail(String(req.params.id));
  const authorBooks = books.filter((b) => b.authorId === author.id);
  res.status(200).json({ total: authorBooks.length, data: authorBooks });
});

// create and store a new author after validation
router.post('/', validateAuthor, (req: Request, res: Response) => {
  const { name, bio, birthYear } = req.body;
  const now = new Date().toISOString();

  const newAuthor: Author = {
    id: randomUUID(),
    name: name.trim(),
    bio,
    birthYear,
    createdAt: now,
    updatedAt: now,
  };

  authors.push(newAuthor);
  res.status(201).json(newAuthor);
});

//update an existing author's details by ID
router.put('/:id', validateAuthor, (req: Request, res: Response) => {
  const author = findAuthorOrFail(String(req.params.id));
  const { name, bio, birthYear } = req.body;

  if (name !== undefined) author.name = name.trim();
  if (bio !== undefined) author.bio = bio;
  if (birthYear !== undefined) author.birthYear = birthYear;
  author.updatedAt = new Date().toISOString();

  res.status(200).json(author);
});

// delete an author if they have no active books associated with them
router.delete('/:id', (req: Request, res: Response) => {
  const author = findAuthorOrFail(String(req.params.id));

  const hasBooks = books.some((b) => b.authorId === author.id);
  if (hasBooks) {
    throw new ConflictError(
      'Cannot delete author: they still have books on record. Delete those books first.'
    );
  }

  const index = authors.findIndex((a) => a.id === author.id);
  authors.splice(index, 1);
  res.status(204).send();
});

export default router;