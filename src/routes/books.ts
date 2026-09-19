import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { authors, books } from '../data/store';
import { validateBook } from '../middleware/validate';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { Book } from '../models/Book';