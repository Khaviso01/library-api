# Library API

A minimal RESTful API for a community library, built with **TypeScript + Express**.
Manages two resources — **Authors** and **Books** — with an in-memory data store,
input validation, and centralized error handling.

> Data is stored in memory and resets whenever the server restarts. There is no database.

## Tech Stack

- Node.js + TypeScript
- Express 4
- In-memory arrays (no external DB)

## Getting Started

```bash
npm install

# development (auto-restart on file changes)
npm run dev

# production
npm run build
npm start
```

The server listens on `http://localhost:3000` by default (override with the `PORT` env var).

## Project Structure

```
src/
  app.ts                 # Express app setup (middleware + routes)
  server.ts              # Entry point — starts the HTTP server
  models/
    Author.ts            # Author type
    Book.ts               # Book type
  data/
    store.ts             # In-memory arrays for authors & books
  middleware/
    logger.ts            # Logs method + URL (+ status/time on finish)
    validate.ts          # Payload validation for POST/PUT
    errorHandler.ts       # 404 handler + centralized error handler
  routes/
    authors.ts           # Author CRUD + GET /authors/:id/books
    books.ts             # Book CRUD
  utils/
    errors.ts            # AppError, ValidationError, NotFoundError, ConflictError
```

## Data Models

**Author**

| Field     | Type   | Required | Notes                         |
|-----------|--------|----------|--------------------------------|
| id        | string | auto     | UUID, generated on create      |
| name      | string | yes      | non-empty                      |
| bio       | string | no       |                                 |
| birthYear | number | no       | integer, `0`–current year      |
| createdAt | string | auto     | ISO timestamp                  |
| updatedAt | string | auto     | ISO timestamp                  |

**Book**

| Field     | Type   | Required | Notes                                     |
|-----------|--------|----------|---------------------------------------------|
| id        | string | auto     | UUID, generated on create                   |
| title     | string | yes      | non-empty                                    |
| authorId  | string | yes      | must reference an existing author            |
| year      | number | no       | integer, `0`–current year                    |
| genre     | string | no       |                                               |
| isbn      | string | no       |                                               |
| createdAt | string | auto     | ISO timestamp                                |
| updatedAt | string | auto     | ISO timestamp                                |

## Endpoints

### Authors

| Method | Endpoint             | Description                          |
|--------|-----------------------|---------------------------------------|
| POST   | `/authors`            | Create a new author                   |
| GET    | `/authors`            | List all authors (filter/sort/paginate) |
| GET    | `/authors/:id`        | Get one author by id                  |
| PUT    | `/authors/:id`        | Update an author (partial update)     |
| DELETE | `/authors/:id`        | Delete an author                      |
| GET    | `/authors/:id/books`  | List all books written by this author |

`GET /authors` query params (all optional):

- `name` — case-insensitive substring match
- `sort` — `name` \| `birthYear` \| `createdAt`
- `order` — `asc` (default) \| `desc`
- `page`, `limit` — pagination

`DELETE /authors/:id` returns **409 Conflict** if the author still has books on record —
delete or reassign those books first.

### Books

| Method | Endpoint      | Description                        |
|--------|---------------|--------------------------------------|
| POST   | `/books`      | Create a new book                    |
| GET    | `/books`      | List all books (search/filter/sort/paginate) |
| GET    | `/books/:id`  | Get one book by id                   |
| PUT    | `/books/:id`  | Update a book (partial update)       |
| DELETE | `/books/:id`  | Delete a book                        |

`GET /books` query params (all optional):

- `title` — case-insensitive substring match
- `authorId` — exact match
- `year` — exact match
- `sort` — `title` \| `year` \| `createdAt`
- `order` — `asc` (default) \| `desc`
- `page`, `limit` — pagination

`POST /books` and `PUT /books/:id` return:
- **400 Bad Request** if `authorId` doesn't reference an existing author
- **409 Conflict** if a book with the same title already exists for that author

## Example Requests

**Create an author**
```bash
curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{"name": "George Orwell", "birthYear": 1903}'
```

**Create a book**
```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title": "1984", "authorId": "<author-id-from-above>", "year": 1949}'
```

**Search books by title, filter by year, sort, paginate**
```bash
curl "http://localhost:3000/books?title=animal&year=1945&sort=year&order=desc&page=1&limit=10"
```

**Get all books by an author**
```bash
curl http://localhost:3000/authors/<author-id>/books
```

**Update a book**
```bash
curl -X PUT http://localhost:3000/books/<book-id> \
  -H "Content-Type: application/json" \
  -d '{"genre": "Dystopian"}'
```

**Delete a book**
```bash
curl -X DELETE http://localhost:3000/books/<book-id>
```

## Error Handling

All errors are returned as JSON in the form `{ "error": "message" }`, with the appropriate
HTTP status code:

| Status | Meaning                                                        |
|--------|------------------------------------------------------------------|
| 400    | Invalid data — missing/malformed field, or `authorId` doesn't exist |
| 404    | Resource (author, book, or route) not found                     |
| 409    | Conflict — duplicate book, or deleting an author who still has books |
| 500    | Unexpected server error                                         |

## Middleware

- **Logger** (`src/middleware/logger.ts`) — logs every request's method, URL, and timestamp,
  plus the response status code and duration once the request finishes.
- **Validation** (`src/middleware/validate.ts`) — validates `POST`/`PUT` payloads for both
  authors and books before the request reaches the route handler.
- **Error handling** (`src/middleware/errorHandler.ts`) — a 404 handler for unknown routes,
  and a centralized error handler that converts thrown `AppError`s into consistent JSON
  responses.

## Testing with Postman

1. Start the server: `npm run dev`
2. Import a new collection in Postman with base URL `http://localhost:3000`
3. Test the flow in this order so relationships resolve correctly:
   1. `POST /authors` → copy the returned `id`
   2. `POST /books` using that `id` as `authorId`
   3. `GET /books`, `GET /authors/:id/books`, `PUT`, `DELETE` as needed
4. Try invalid payloads (missing `name`/`title`, bad `authorId`, duplicate book, deleting an
   author with books) to confirm the 400/404/409 responses.

## Possible Next Steps

- Swap the in-memory store for a real database (e.g., SQLite/Postgres via Prisma)
- Add authentication for librarian-only write access
- Add automated tests (Jest + Supertest)
