'use strict';

const express = require('express');
const path = require('path');
const { auth } = require('./middleware/auth');
const tasksRouter = require('./routes/tasks');
const usersRouter = require('./routes/users');
const tagsRouter = require('./routes/tags');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(auth);

app.use('/tasks', tasksRouter);
app.use('/users', usersRouter);
app.use('/tags', tagsRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// MISSING: global error handler — unhandled errors bubble up as 500 with an HTML response

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Taskly API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
