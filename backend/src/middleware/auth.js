"use strict";

const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches req.user = { id, email, role, status } on success.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const token = authHeader.slice(7);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message = err.name === "TokenExpiredError" ? "Session expired. Please log in again." : "Invalid token.";
    return res.status(401).json({ success: false, message });
  }

  // Load the user on every request so status changes are reflected immediately
  let user;
  try {
    user = await User.findByPk(payload.sub, {
      attributes: ["id", "email", "role", "status", "firstName", "lastName"],
    });
  } catch (err) {
    return next(err);
  }

  if (!user) {
    return res.status(401).json({ success: false, message: "Account not found." });
  }

  if (user.status === "SUSPENDED") {
    return res.status(403).json({ success: false, message: "Your account has been suspended." });
  }

  if (user.status === "INACTIVE") {
    return res.status(403).json({ success: false, message: "Your account is inactive." });
  }

  req.user = user;
  next();
}

/**
 * Returns middleware that restricts access to one or more roles.
 * Always call authenticate first.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You do not have permission to perform this action." });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
