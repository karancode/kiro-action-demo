'use strict';

// TODO: implement API key validation
// Currently this middleware always passes — all requests are treated as authenticated.
function auth(req, res, next) {
  next();
}

module.exports = { auth };
