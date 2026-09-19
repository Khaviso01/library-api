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

// Get authors
router.get('/', (req: Request, res: Response) => {
  let result = [...authors];
  const { name, sort, order, page, limit } = req.query;

  if (typeof name === 'string' && name.trim()) {
    const q = name.toLowerCase();
    result = result.filter((a) => a.name.toLowerCase().includes(q));
  }

  if (sort === 'name' || sort === 'birthYear' || sort === 'createdAt') {
    const dir = order === 'desc' ? -1 : 1;
    result.sort((a: any, b: any) => {
      if (a[sort] === undefined) return 1;
      if (b[sort] === undefined) return -1;
      return a[sort] > b[sort] ? dir : a[sort] < b[sort] ? -dir : 0;
    });
  }

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

router.get('/:id', (req: Request, res: Response) => {
  const author = getAuthorById(req.params.id);
  res.status(200).json(author);
});