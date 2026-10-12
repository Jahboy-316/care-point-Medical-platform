"use strict";

/** Creates an application error with an HTTP status code. */
function createError(message, statusCode = 500) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

/**
 * Parses and validates pagination query params.
 * Returns { page, limit, offset }.
 */
function parsePagination(query, maxLimit = 100) {
  let page = parseInt(query.page, 10) || 1;
  let limit = parseInt(query.limit, 10) || 20;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Builds a standard paginated response body.
 */
function paginatedResponse(data, count, page, limit) {
  return {
    success: true,
    data,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
}

module.exports = { createError, parsePagination, paginatedResponse };
