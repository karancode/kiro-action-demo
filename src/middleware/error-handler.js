'use strict';

// WIP: stub only — not wired up yet.
// Should send JSON { error: "<message>" } with an appropriate status code,
// matching the error shape the route handlers already use.
function errorHandler(err, req, res, next) {
  throw new Error('not implemented');
}

module.exports = { errorHandler };
