'use strict';

const tasks = [
  {
    id: 1,
    title: 'Set up CI pipeline',
    description: 'Configure GitHub Actions for lint, test, and build.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-06-01',
    tags: [1, 2],
  },
  {
    id: 2,
    title: 'Write API documentation',
    description: 'Document all REST endpoints with request/response examples.',
    status: 'todo',
    priority: 'medium',
    assigneeId: 2,
    dueDate: '2026-06-15',
    tags: [2],
  },
  {
    id: 3,
    title: 'Add rate limiting',
    description: 'Protect the API from abuse by adding per-IP rate limiting.',
    status: 'todo',
    priority: 'low',
    assigneeId: null,
    dueDate: null,
    tags: [],
  },
  {
    id: 4,
    title: 'Fix pagination bug',
    description: 'Page 1 and page 0 return the same results.',
    status: 'todo',
    priority: 'high',
    assigneeId: 1,
    dueDate: '2026-05-20',
    tags: [1],
  },
];

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

const tags = [
  { id: 1, name: 'bug' },
  { id: 2, name: 'documentation' },
  { id: 3, name: 'enhancement' },
];

function findById(collection, id) {
  return collection.find((item) => item.id === Number(id)) || null;
}

function nextId(collection) {
  if (collection.length === 0) return 1;
  return Math.max(...collection.map((item) => item.id)) + 1;
}

module.exports = { tasks, users, tags, findById, nextId };
