import { Author } from '../models/Author';
import { Book } from '../models/Book';

// In-memory database. Data resets whenever the server restarts.
export const authors: Author[] = [];
export const books: Book[] = [];
