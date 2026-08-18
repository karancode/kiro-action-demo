'use strict';

const { Router } = require('express');
const store = require('../store');
const { paginate } = require('../utils/pagination');
const { validateCreateUser } = require('../middleware/validate');

const router = Router();

router.get('/', (req, res) => {
  const { page, limit } = req.query;
  const result = paginate(store.users, page, limit);
  res.json({ users: result.items, total: result.total, page: result.page, limit: result.limit });
});

router.get('/:id', (req, res) => {
  const user = store.findById(store.users, req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/', validateCreateUser, (req, res) => {
  const { name, email } = req.body;
  const user = {
    id: store.nextId(store.users),
    name: name.trim(),
    email: email.trim(),
  };
  store.users.push(user);
  res.status(201).json(user);
});

router.get('/:id/tasks', (req, res) => {
  const user = store.findById(store.users, req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const userTasks = store.tasks.filter((t) => t.assigneeId === user.id);
  const { page, limit } = req.query;
  const result = paginate(userTasks, page, limit);
  res.json({ tasks: result.items, total: result.total, page: result.page, limit: result.limit });
});

module.exports = router;
