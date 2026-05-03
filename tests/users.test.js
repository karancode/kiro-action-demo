'use strict';

const request = require('supertest');
const app = require('../src/server');
const store = require('../src/store');

beforeEach(() => {
  store.users.length = 0;
  store.users.push(
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  );
});

describe('GET /users', () => {
  it('returns 200 with user list', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});

describe('POST /users', () => {
  it('creates a user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Charlie', email: 'charlie@example.com' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Charlie');
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/users').send({ email: 'x@example.com' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is invalid', async () => {
    const res = await request(app).post('/users').send({ name: 'Dave', email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

// NOTE: GET /users/:id/tasks is not tested because the endpoint does not exist yet (Issue #3)
