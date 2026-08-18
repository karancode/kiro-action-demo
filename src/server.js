'use strict';

const express = require('express');
const path = require('path');
const { auth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/error-handler');
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

// Global error handler — must be the last middleware, after the routers
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Taskly API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
