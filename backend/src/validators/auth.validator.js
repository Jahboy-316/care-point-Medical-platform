"use strict";

const { body } = require("express-validator");

const registerRules = [
  body("email")
    .isEmail().withMessage("A valid email address is required.")
    .normalizeEmail({ gmail_remove_dots: false }),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/).withMessage("Password must contain at least one number."),
  body("firstName")
    .trim().notEmpty().withMessage("First name is required.")
    .isLength({ max: 100 }).withMessage("First name must not exceed 100 characters."),
  body("lastName")
    .trim().notEmpty().withMessage("Last name is required.")
    .isLength({ max: 100 }).withMessage("Last name must not exceed 100 characters."),
];

const loginRules = [
  body("email").isEmail().withMessage("A valid email address is required.").normalizeEmail({ gmail_remove_dots: false }),
  body("password").notEmpty().withMessage("Password is required."),
];

module.exports = { registerRules, loginRules };
