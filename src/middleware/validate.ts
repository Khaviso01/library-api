import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

const currentYear = new Date().getFullYear();

function isValidYear(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= currentYear;
}