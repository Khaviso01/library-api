import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

const currentYear = new Date().getFullYear();

function isValidYear(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= currentYear;
}

export function validateAuthor(req: Request, res: Response, next: NextFunction): void {
  const { name, bio, birthYear } = req.body ?? {};
  const isCreate = req.method === 'POST';

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