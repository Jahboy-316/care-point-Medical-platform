"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, PatientProfile, sequelize } = require("../models");
const { createError } = require("../utils/helpers");

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

async function register({ email, password, firstName, lastName }) {
  // Check duplicate email (normalize before checking)
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ where: { email: normalizedEmail } });

  // Use a generic message to avoid revealing whether an account exists
  if (existing) {
    throw createError("Registration failed. Please check your details and try again.", 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Use a transaction so user and profile are created atomically
  const user = await sequelize.transaction(async (t) => {
    const newUser = await User.create(
      { email: normalizedEmail, passwordHash, firstName, lastName, role: "PATIENT", status: "ACTIVE" },
      { transaction: t }
    );
    await PatientProfile.create({ userId: newUser.id }, { transaction: t });
    return newUser;
  });

  return user;
}

async function login({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  // Always load user; use generic message to avoid account enumeration
  const user = await User.findOne({ where: { email: normalizedEmail } });

  const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !isValid) {
    throw createError("Invalid email or password.", 401);
  }

  if (user.status === "SUSPENDED") {
    throw createError("Your account has been suspended. Please contact support.", 403);
  }

  if (user.status === "INACTIVE") {
    throw createError("Your account is inactive. Please contact support.", 403);
  }

  const token = issueToken(user);
  return { token, user };
}

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function getMe(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["passwordHash"] },
    include: [
      { association: "patientProfile" },
      { association: "providerProfile" },
    ],
  });
  if (!user) throw createError("User not found.", 404);
  return user;
}

module.exports = { register, login, getMe };
