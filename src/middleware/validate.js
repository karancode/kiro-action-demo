'use strict';

function validateCreateTask(req, res, next) {
  const { title, status, priority } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }

  const validStatuses = ['todo', 'in_progress', 'done'];
  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  // BUG: priority is not validated — any string is accepted
  // It should only allow: low, medium, high
  void priority;

  next();
}

// BUG: PUT /tasks/:id has no validation middleware registered
// The same rules from validateCreateTask should apply here
function validateCreateUser(req, res, next) {
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required and must be a non-empty string' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'email is required and must be a valid email address' });
  }

  next();
}

function validatePatchTask(req, res, next) {
  const { title, status, priority } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'title must be a non-empty string' });
  }

  const validStatuses = ['todo', 'in_progress', 'done'];
  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const validPriorities = ['low', 'medium', 'high'];
  if (priority !== undefined && !validPriorities.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of: ${validPriorities.join(', ')}` });
  }

  next();
}

module.exports = { validateCreateTask, validateCreateUser, validatePatchTask };
