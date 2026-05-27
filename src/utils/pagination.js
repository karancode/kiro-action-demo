'use strict';

// BUG: page calculation is 0-indexed but callers expect 1-indexed pages.
// page=1 and page=0 return identical results; page=1 skips the first `limit` items.
function paginate(data, page, limit) {
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;

  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    items: data.slice(start, end),
    total: data.length,
    page,
    limit,
  };
}

module.exports = { paginate };
