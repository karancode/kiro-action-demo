'use strict';

// Global error handler: responds with JSON { error: "<message>" } using
// err.status when present, otherwise 500. Matches the error shape the route
// handlers already use.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
