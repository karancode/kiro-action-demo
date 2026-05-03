'use strict';

const { Router } = require('express');
const store = require('../store');
const { validateCreateUser } = require('../middleware/validate');

const router = Router();

// INCONSISTENCY: returns a bare array instead of { users, total, page, limit }
// All other list endpoints return a paginated shape — this one does not (see auto mode prompt)
router.get('/', (req, res) => {
  res.json(store.users);
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

// MISSING: GET /users/:id/tasks — not implemented (see Issue #3)

module.exports = router;
