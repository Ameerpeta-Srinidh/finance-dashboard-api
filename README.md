# Finance Dashboard API

A TypeScript backend for a finance dashboard with authentication, role-based access control, transaction management, audit logging, and reporting endpoints.

## Project Summary

This is a backend service for a finance dashboard where users can sign up, log in, manage financial records, and access analytics based on their role. The project covers clean backend architecture, JWT authentication, RBAC, soft-delete patterns, input validation, and automated testing.

## Core Features

- User registration and login
- JWT authentication with protected routes
- Role-based access control for `VIEWER`, `ANALYST`, and `ADMIN`
- Transaction listing, creation, update, and soft delete
- Dashboard summary, category breakdown, monthly trends, and recent activity
- Audit logging for transaction changes
- Swagger documentation at `/api/docs`

## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express
- ORM: Prisma
- Database: SQLite
- Validation: Zod
- Authentication: JSON Web Tokens and bcrypt
- Testing: Jest and Supertest

## Architecture

The project is split into focused layers so that each part has one responsibility:

- `routes` define endpoints and attach middleware
- `controllers` handle HTTP requests and responses
- `services` contain business rules and database operations
- `validators` define request contracts using Zod
- `middleware` handles authentication, authorization, and centralized error handling
- `utils` contains shared helpers for Prisma setup, Swagger configuration, and response formatting

This structure keeps controllers thin and moves decision-making into services, which makes the codebase easier to test, extend, and debug.

## Request Flow

A typical request follows this path:

1. Express receives the request in `app.ts`
2. The route matches an endpoint and applies middleware
3. Authentication middleware verifies the bearer token
4. Role middleware checks whether the user has access
5. The controller validates the request body using Zod
6. The controller calls the appropriate service
7. The service runs Prisma queries and applies business rules
8. A shared response helper formats the JSON output
9. Any thrown error is caught by the global error middleware

## Roles and Permissions

| Action | VIEWER | ANALYST | ADMIN |
|--------|--------|---------|-------|
| View transactions | Yes | Yes | Yes |
| View dashboard analytics | No | Yes | Yes |
| Create, update, delete transactions | No | No | Yes |
| Manage users | No | No | Yes |

## Business Rules

- Public registration defaults to `VIEWER`
- The first user can bootstrap as `ADMIN` if the database is empty
- Inactive users cannot log in
- Only admins can create, update, or delete transactions
- Transactions are soft-deleted instead of permanently removed
- Admins cannot change their own role from the admin endpoint
- Admins cannot deactivate themselves from the admin endpoint
- The last active admin cannot be demoted or deactivated
- Dashboard analytics are limited to `ANALYST` and `ADMIN`
- Every transaction change creates an audit log entry

## Database Design

The Prisma schema contains three models:

### `User`

Stores identity fields (`name`, `email`), hashed password, role, account status, and timestamps.

### `Transaction`

Stores amount, type (`INCOME` or `EXPENSE`), category, date, optional description, soft-delete flag, and the creating user reference. Includes a composite index on `type`, `category`, and `date` for query performance.

### `AuditLog`

Stores the action type (`CREATE`, `UPDATE`, `DELETE`), the acting user, the affected transaction ID, optional serialized details, and a timestamp.

## Design Decisions

### Soft Delete

Transactions are never physically removed. `isDeleted` is set to `true` instead. This preserves historical data, supports audits, and prevents accidental data loss.

### Audit Logging

Every transaction create, update, and delete is logged with the acting user and a snapshot of the change. This adds traceability and accountability around financial data modifications.

### Layered Validation

Validation is handled by Zod before data reaches the service layer. This keeps controllers predictable, avoids scattered checks, and produces consistent validation error responses.

### SQLite

SQLite keeps the project simple to set up and run locally without external dependencies. For a production finance system, I would switch to PostgreSQL and store currency values in minor units or use a proper decimal strategy.

## Assumptions

- All monetary values are stored as floating-point numbers. This is acceptable for a demo but would need a minor-unit or decimal strategy in production.
- Registration is open and always assigns the `VIEWER` role. Only the first registration can bootstrap an `ADMIN` account when the database is empty.
- The system does not implement refresh tokens. JWTs expire based on the `JWT_EXPIRES_IN` environment variable and must be re-obtained through login.
- Soft-deleted transactions are excluded from all queries and analytics. There is no endpoint to restore them.
- Audit logs are append-only. There is no endpoint to query or export them directly — they exist for backend traceability.

## Security

- Passwords are hashed using bcrypt before storage
- Protected routes require a valid JWT
- Authorization is enforced with dedicated middleware
- Inactive users are blocked from login
- Duplicate email registration is prevented
- Self-demotion and self-deactivation are blocked for admins

## Error Handling

All responses follow a consistent JSON shape:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "...", "errors": { ... } }
```

Errors are handled through a centralized middleware that catches:

- **Zod validation errors** — returns 400 with field-level details
- **Application errors** — custom `AppError` class with appropriate status codes
- **Prisma errors** — database constraint violations return 400 with error metadata
- **Unhandled errors** — caught as 500 without leaking internals

## Dashboard Logic

The dashboard module performs calculations on transaction data rather than simple CRUD:

- `summary` returns total income, total expense, net balance, and record counts
- `category-breakdown` groups transactions by category and type
- `monthly-trends` aggregates income and expense month by month for a given year
- `recent-activity` returns the latest non-deleted transactions

## Testing

The test suite uses Jest and Supertest and covers:

- Authentication flows (registration, login, bootstrap admin, duplicate handling)
- Transaction access control and CRUD behavior
- Soft delete behavior and filtered listing
- Dashboard access control and analytics accuracy
- Admin-only user management endpoints

Run tests:

```bash
npm test -- --runInBand
```

## Setup

```bash
npm install
copy .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The app exposes:

- Swagger docs at `http://localhost:3000/api/docs`
- Health check at `http://localhost:3000/api/health`

## Environment Variables

Defined in `.env.example`:

- `DATABASE_URL` — SQLite file path
- `JWT_SECRET` — signing secret for tokens
- `JWT_EXPIRES_IN` — token expiry duration
- `PORT` — server port
- `NODE_ENV` — runtime environment

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin12345 |
| Analyst | analyst@test.com | analyst12345 |
| Viewer | viewer@test.com | viewer12345 |

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Users (Admin only)

- `GET /api/users`
- `PATCH /api/users/:id/role`
- `PATCH /api/users/:id/status`

### Transactions

- `GET /api/transactions` — all roles
- `GET /api/transactions/:id` — all roles
- `POST /api/transactions` — admin only
- `PATCH /api/transactions/:id` — admin only
- `DELETE /api/transactions/:id` — admin only

The `GET /api/transactions` endpoint supports filtering and pagination through query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `INCOME` or `EXPENSE` | Filter by transaction type |
| `category` | string | Partial match on category name |
| `startDate` | ISO date | Records on or after this date |
| `endDate` | ISO date | Records on or before this date |
| `page` | integer | Page number, defaults to 1 |
| `limit` | integer | Records per page, defaults to 10, max 100 |

Paginated responses include a `pagination` object with `total`, `page`, and `totalPages`.

### Dashboard (Analyst and Admin)

- `GET /api/dashboard/summary`
- `GET /api/dashboard/category-breakdown`
- `GET /api/dashboard/monthly-trends?year=2026`
- `GET /api/dashboard/recent-activity?limit=10`

## Future Improvements

- Switch from SQLite to PostgreSQL for production
- Store monetary values in minor units or a stricter decimal strategy
- Add refresh tokens and session management
- Add rate limiting and security headers
- Add pagination and filtering edge-case tests
- Add CI integration for typecheck, tests, and linting
