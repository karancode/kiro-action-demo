'use strict';

const { Router } = require('express');
const store = require('../store');
const { paginate } = require('../utils/pagination');
const { validateCreateTask, validatePatchTask } = require('../middleware/validate');

const router = Router();

router.get('/', (req, res) => {
  const { page, limit } = req.query;
  const result = paginate(store.tasks, page, limit);
  res.json({ tasks: result.items, total: result.total, page: result.page, limit: result.limit });
});

router.get('/:id', (req, res) => {
  const task = store.findById(store.tasks, req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.post('/', validateCreateTask, (req, res) => {
  const { title, description, status, priority, assigneeId, dueDate, tags } = req.body;
  const task = {
    id: store.nextId(store.tasks),
    title: title.trim(),
    description: description || null,
    status: status || 'todo',
    priority: priority || 'medium',
    assigneeId: assigneeId || null,
    dueDate: dueDate || null,
    tags: tags || [],
  };
  store.tasks.push(task);
  res.status(201).json(task);
});

router.put('/:id', validateCreateTask, (req, res) => {
  const task = store.findById(store.tasks, req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, status, priority, assigneeId, dueDate, tags } = req.body;
  Object.assign(task, {
    title: title !== undefined ? title : task.title,
    description: description !== undefined ? description : task.description,
    status: status !== undefined ? status : task.status,
    priority: priority !== undefined ? priority : task.priority,
    assigneeId: assigneeId !== undefined ? assigneeId : task.assigneeId,
    dueDate: dueDate !== undefined ? dueDate : task.dueDate,
    tags: tags !== undefined ? tags : task.tags,
  });
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const index = store.tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  store.tasks.splice(index, 1);
  res.status(204).end();
});

// MISSING: PATCH /tasks/:id — not implemented (see Issue #2)
router.patch('/:id', validatePatchTask, (req, res) => {
  const task = store.findById(store.tasks, req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const fields = ['title', 'description', 'status', 'priority', 'assigneeId', 'dueDate', 'tags'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = field === 'title' ? req.body[field].trim() : req.body[field];
    }
  });
  res.json(task);
});

module.exports = router;
