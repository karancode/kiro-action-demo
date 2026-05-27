'use strict';

const { Router } = require('express');
const store = require('../store');

const router = Router();

router.get('/', (req, res) => {
  res.json(store.tags);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required and must be a non-empty string' });
  }
  const tag = { id: store.nextId(store.tags), name: name.trim() };
  store.tags.push(tag);
  res.status(201).json(tag);
});


module.exports = router;
