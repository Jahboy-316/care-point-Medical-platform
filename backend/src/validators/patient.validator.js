"use strict";

const { body } = require("express-validator");

const updatePatientProfileRules = [
  body("phone").optional().trim().isLength({ max: 30 }).withMessage("Phone must not exceed 30 characters."),
  body("dateOfBirth")
    .optional()
    .isISO8601().withMessage("dateOfBirth must be a valid date (YYYY-MM-DD).")
    .custom((val) => {
      if (new Date(val) > new Date()) throw new Error("Date of birth cannot be in the future.");
      return true;
    }),
  body("address").optional().trim().isLength({ max: 255 }).withMessage("Address must not exceed 255 characters."),
  body("emergencyContactName").optional().trim().isLength({ max: 150 }).withMessage("Emergency contact name too long."),
  body("emergencyContactPhone").optional().trim().isLength({ max: 30 }).withMessage("Emergency contact phone too long."),
  body("emergencyContactRelationship").optional().trim().isLength({ max: 80 }).withMessage("Relationship too long."),
  // Prevent mass-assignment of role or status
  body("role").not().exists().withMessage("Role cannot be changed via this endpoint."),
  body("status").not().exists().withMessage("Status cannot be changed via this endpoint."),
];

module.exports = { updatePatientProfileRules };
