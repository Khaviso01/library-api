import { Author } from '../models/Author'
import { Book } from '../models/Book'

// in-memory database, resets when server restarts
export const authors: Author[] = [];
export const books: Book[] = [];
