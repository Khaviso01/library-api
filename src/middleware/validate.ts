import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';


// Get current year to validate publication of years
const currentYear = new Date().getFullYear();

// Helper function to check if given value is an integer
function isValidYear(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= currentYear;
}

// Middleware to validate author request bodies
export function validateAuthor(req: Request, res: Response, next: NextFunction): void {
  const { name, bio, birthYear } = req.body ?? {};
  const isCreate = req.method === 'POST';

  // Enforcing mandatory name requirement for validation
  if (isCreate) {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return next(new ValidationError('"name" is required and must be a non-empty string'));
    }
  } else if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return next(new ValidationError('"name" must be a non-empty string'));
  }

  if (bio !== undefined && typeof bio !== 'string') {
    return next(new ValidationError('"bio" must be a string'));
  }

  if (birthYear !== undefined && !isValidYear(birthYear)) {
    return next(new ValidationError(`"birthYear" must be an integer between 0 and ${currentYear}`));
  }

  next();
}

// Middleware to validate book request bodies
export function validateBook(req: Request, res: Response, next: NextFunction): void {
  const { title, authorId, year, genre, isbn } = req.body ?? {};
  const isCreate = req.method === 'POST';

  // Ensuring title and author ids are present for creation
  if (isCreate) {
    if (!title || typeof title !== 'string' || !title.trim()) {
      return next(new ValidationError('"title" is required and must be a non-empty string'));
    }
    if (!authorId || typeof authorId !== 'string' || !authorId.trim()) {
      return next(new ValidationError('"authorId" is required and must reference an existing author'));
    }
  } else {
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return next(new ValidationError('"title" must be a non-empty string'));
    }
    if (authorId !== undefined && (typeof authorId !== 'string' || !authorId.trim())) {
      return next(new ValidationError('"authorId" must be a non-empty string'));
    }
  }

  // Validate the book publication year against the valid year range
  if (year !== undefined && !isValidYear(year)) {
    return next(new ValidationError(`"year" must be an integer between 0 and ${currentYear}`));
  }

  // Validate that genre is a string type if provided
  if (genre !== undefined && typeof genre !== 'string') {
    return next(new ValidationError('"genre" must be a string'));
  }

  // Validate that isbn is a string type if provided
  if (isbn !== undefined && typeof isbn !== 'string') {
    return next(new ValidationError('"isbn" must be a string'));
  }

  next();
}
