"use strict";

const authService = require("../services/auth.service");

async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName } = req.body;
    const user = await authService.register({ email, password, firstName, lastName });
    const token = require("jsonwebtoken").sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login({ email, password });
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

// JWT is stateless — logout advice: the client discards the token.
// A token blocklist would require Redis or similar; out of scope here.
function logout(req, res) {
  return res.status(200).json({
    success: true,
    message: "Logged out. Please discard your token on the client.",
  });
}

module.exports = { register, login, getMe, logout };
