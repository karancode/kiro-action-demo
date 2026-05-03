# Taskly API

A minimal task management REST API built with Node.js and Express. This repo is also a test harness for [`karancode/kiro-action`](https://github.com/karancode/kiro-action).

## Getting Started

```bash
npm install
npm start       # → http://localhost:3000
npm test
npm run lint
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /tasks | List all tasks (paginated) |
| GET | /tasks/:id | Get a task |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Replace a task |
| GET | /users | List all users |
| GET | /users/:id | Get a user |
| POST | /users | Create a user |
| GET | /tags | List all tags |
| POST | /tags | Create a tag |

## Example Requests

```bash
# List tasks (page 1, 2 per page)
curl "http://localhost:3000/tasks?page=1&limit=2"

# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My task", "priority": "high", "status": "todo"}'

# Update a task
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title", "status": "done"}'

# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'
```

## Testing kiro-action

This repo is pre-loaded with intentional gaps and bugs to test all three trigger modes of [kiro-action](https://github.com/karancode/kiro-action).

### Setup
1. Add your `KIRO_API_KEY` as a repository secret (Settings → Secrets → Actions)
2. Ensure a GitHub user named `kiro` exists for assign-mode tests

### Trigger Modes

| Mode | How to Use |
|------|-----------|
| **Comment** | Post `@kiro <instruction>` on any issue or PR |
| **Assign** | Assign an issue to the `kiro` GitHub user |
| **Auto** | Runs automatically every Monday 9 AM UTC, or on push to `main/src/**` |

### Pre-Written Issues

Create these issues in order after pushing to GitHub:

| # | Title | Trigger Mode |
|---|-------|--------------|
| 1 | Add `DELETE /tasks/:id` endpoint | Comment |
| 2 | Add `PATCH /tasks/:id` for partial updates | Comment |
| 3 | Add `GET /users/:id/tasks` endpoint | Assign |
| 4 | Implement task tagging endpoints | Comment |
| 5 | Bug: `priority` field accepts invalid values | Comment |
| 6 | Bug: pagination returns wrong page (off-by-one) | Assign |

See [CLAUDE.md](./CLAUDE.md) for the full list of intentional gaps and codebase conventions.
