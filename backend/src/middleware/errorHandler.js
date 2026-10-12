"use strict";

/**
 * Central error-handling middleware.
 * Must be registered AFTER all routes with exactly four parameters.
 *
 * In production: never expose stack traces, SQL errors, or secrets.
 * In development: log the full error for debugging.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === "development";

  // Log the error server-side (without exposing tokens or patient data)
  if (isDev) {
    console.error("[ERROR]", err);
  } else {
    console.error("[ERROR]", err.message);
  }

  // Sequelize unique constraint violation
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors && err.errors[0] ? err.errors[0].path : "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  // Sequelize validation error from model validators
  if (err.name === "SequelizeValidationError") {
    return res.status(422).json({
      success: false,
      message: "Validation error.",
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Sequelize foreign key / referential constraint
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      success: false,
      message: "A referenced record does not exist.",
    });
  }

  // Known application errors that set a status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "An error occurred.",
    });
  }

  // Default: unexpected server error
  return res.status(500).json({
    success: false,
    message: isDev ? err.message : "An unexpected error occurred. Please try again.",
  });
}

module.exports = { errorHandler };
