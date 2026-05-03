# Taskly API

## Project Overview
Taskly is a Node.js/Express REST API for task management. It uses an in-memory store — no database, no build step. All data resets on server restart.

## Architecture
- `src/server.js` — Express app entry point; mounts routes at `/tasks`, `/users`, `/tags`
- `src/routes/` — one file per resource, uses Express Router
- `src/store/index.js` — single source of truth for all data; exports `tasks[]`, `users[]`, `tags[]` plus helpers
- `src/middleware/validate.js` — request body validation for POST/PUT routes
- `src/middleware/auth.js` — stub auth middleware (always passes)
- `src/utils/pagination.js` — pagination helper used by list endpoints

## Coding Conventions
- CommonJS modules (`require` / `module.exports`), not ESM
- Route handlers return JSON with explicit status codes
- All successful list responses use shape: `{ items, total, page, limit }`
  - `GET /tasks` uses `tasks` as the key instead of `items`
  - `GET /users` currently returns a bare array — this is a known inconsistency
- Error responses use shape: `{ error: "descriptive message" }`
- Store helpers:
  - `store.findById(collection, id)` — returns the matching item or `null`
  - `store.nextId(collection)` — returns `max(id) + 1`

## Running Locally
```
npm install
npm start       # → http://localhost:3000
npm test
npm run lint
```

## Adding a New Endpoint
1. Add the route handler in the relevant file under `src/routes/`
2. If the endpoint accepts a request body, add a validator in `src/middleware/validate.js` and register it as middleware before the handler
3. Add at least one happy-path and one error-path test in `tests/`

## Known Intentional Gaps (for kiro-action testing)

| Gap | File | Issue |
|-----|------|-------|
| Missing `DELETE /tasks/:id` | `src/routes/tasks.js` | #1 |
| Missing `PATCH /tasks/:id` | `src/routes/tasks.js` | #2 |
| Missing `GET /users/:id/tasks` | `src/routes/users.js` | #3 |
| Missing task-tagging endpoints | `src/routes/tags.js` | #4 |
| `priority` field not enum-validated | `src/middleware/validate.js` | #5 |
| Off-by-one in pagination | `src/utils/pagination.js` | #6 |
| Inconsistent `GET /users` response shape | `src/routes/users.js` | auto |
| Stub auth (always passes) | `src/middleware/auth.js` | — |
| No global error handler | `src/server.js` | — |

## Do Not
- Add a database — keep everything in-memory via `src/store/index.js`
- Add TypeScript or a compilation step
- Change the module system (keep CommonJS)
- Use `process.exit()` in route handlers
