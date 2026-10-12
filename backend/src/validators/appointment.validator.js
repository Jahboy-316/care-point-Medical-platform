"use strict";

const { body } = require("express-validator");

// Standard UUID format regex (covers versions 1-5 and deterministic hex UUIDs used in demo seeds)
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const createAppointmentRules = [
  body("providerId")
    .notEmpty().withMessage("providerId is required.")
    .matches(UUID_REGEX).withMessage("providerId must be a valid UUID."),
  body("serviceId")
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === undefined || val === "") return true;
      if (!UUID_REGEX.test(val)) throw new Error("serviceId must be a valid UUID.");
      return true;
    }),
  body("startTime")
    .notEmpty().withMessage("startTime is required.")
    .isISO8601().withMessage("startTime must be a valid ISO 8601 datetime.")
    .toDate(),
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Reason must not exceed 1000 characters."),
];

const cancelAppointmentRules = [
  body("cancellationReason")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Cancellation reason must not exceed 500 characters."),
];

const updateStatusRules = [
  body("status")
    .notEmpty().withMessage("status is required.")
    .isIn(["CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"])
    .withMessage("Invalid status value."),
  body("rejectionNote")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Rejection note must not exceed 500 characters."),
  body("cancellationReason")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Cancellation reason must not exceed 500 characters."),
];

module.exports = { createAppointmentRules, cancelAppointmentRules, updateStatusRules };
