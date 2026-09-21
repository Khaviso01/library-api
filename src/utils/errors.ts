// Base application error class extending the native JavaScript Error object
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    // Restore proper prototype chain for custom error classes in TypeScript/ES6
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 400 Bad Request error used for invalid input data or validation failures
export class ValidationError extends AppError {
  constructor(message = 'Invalid data') {
    super(message, 400);
  }
}

// 404 Not Found error used when a requested resource or route does not exist
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// 409 Conflict error used when an operation clashes with existing records (e.g. duplicates)
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}