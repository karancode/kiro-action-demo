'use strict';

const request = require('supertest');
const app = require('../src/server');
const store = require('../src/store');

beforeEach(() => {
  // Reset store to known state before each test
  store.tasks.length = 0;
  store.tasks.push(
    { id: 1, title: 'Task One', description: null, status: 'todo', priority: 'high', assigneeId: 1, dueDate: null, tags: [] },
    { id: 2, title: 'Task Two', description: null, status: 'todo', priority: 'medium', assigneeId: null, dueDate: null, tags: [] },
    { id: 3, title: 'Task Three', description: null, status: 'done', priority: 'low', assigneeId: 1, dueDate: null, tags: [] },
    { id: 4, title: 'Task Four', description: null, status: 'todo', priority: 'medium', assigneeId: 2, dueDate: null, tags: [] }
  );
});

describe('GET /tasks', () => {
  it('returns all tasks with pagination shape', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tasks');
    expect(res.body).toHaveProperty('total', 4);
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
  });
});

describe('GET /tasks/:id', () => {
  it('returns a task by id', async () => {
    const res = await request(app).get('/tasks/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe('Task One');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/tasks/9999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /tasks', () => {
  it('creates a new task and returns 201', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'New Task', priority: 'low' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Task');
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/tasks').send({ priority: 'low' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when title is empty string', async () => {
    const res = await request(app).post('/tasks').send({ title: '   ' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /tasks/:id', () => {
  it('updates a task', async () => {
    const res = await request(app)
      .put('/tasks/1')
      .send({ title: 'Updated', status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
    expect(res.body.status).toBe('done');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).put('/tasks/9999').send({ title: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  it('deletes a task and returns 204', async () => {
    const res = await request(app).delete('/tasks/1');
    expect(res.status).toBe(204);
    expect(store.tasks.find((t) => t.id === 1)).toBeUndefined();
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).delete('/tasks/9999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

// NOTE: DELETE /tasks/:id tests added (Issue #1)
// NOTE: PATCH /tasks/:id tests below (Issue #2)

describe('PATCH /tasks/:id', () => {
  it('partially updates a task', async () => {
    const res = await request(app).patch('/tasks/1').send({ status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('done');
    expect(res.body.title).toBe('Task One');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app).patch('/tasks/9999').send({ status: 'done' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app).patch('/tasks/1').send({ status: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid priority', async () => {
    const res = await request(app).patch('/tasks/1').send({ priority: 'critical' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty title', async () => {
    const res = await request(app).patch('/tasks/1').send({ title: '  ' });
    expect(res.status).toBe(400);
  });
});

describe('GET /tasks/stats', () => {
  it('returns status breakdown of existing tasks', async () => {
    const res = await request(app).get('/tasks/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 4, byStatus: { todo: 3, in_progress: 0, done: 1 } });
  });

  it('returns zeroes when store is empty', async () => {
    store.tasks.length = 0;
    const res = await request(app).get('/tasks/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 0, byStatus: { todo: 0, in_progress: 0, done: 0 } });
  });
});

describe('GET /tasks pagination', () => {
  it('page=1&limit=2 returns the first two tasks', async () => {
    const res = await request(app).get('/tasks?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.tasks[0].id).toBe(1);
    expect(res.body.tasks[1].id).toBe(2);
    expect(res.body.page).toBe(1);
  });

  it('page=2&limit=2 returns tasks 3–4', async () => {
    const res = await request(app).get('/tasks?page=2&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
    expect(res.body.tasks[0].id).toBe(3);
    expect(res.body.tasks[1].id).toBe(4);
    expect(res.body.page).toBe(2);
  });
});
