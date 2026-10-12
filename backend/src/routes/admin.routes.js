"use strict";

const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
const { authenticate, requireRole } = require("../middleware/auth");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");

// All admin routes require ADMIN role
router.use(authenticate, requireRole("ADMIN"));

// ---- Users ----
router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUser);
router.patch(
  "/users/:id/status",
  [body("status").isIn(["ACTIVE", "INACTIVE", "SUSPENDED"]).withMessage("Invalid status.")],
  validate,
  adminController.updateUserStatus
);

// ---- Providers ----
router.get("/providers", adminController.listProviders);
router.patch(
  "/providers/:id/status",
  [body("isActive").isBoolean().withMessage("isActive must be a boolean.")],
  validate,
  adminController.updateProviderStatus
);

// ---- Services ----
router.get("/services", adminController.listServices);
router.post(
  "/services",
  [
    body("name").trim().notEmpty().withMessage("Service name is required."),
    body("durationMinutes").optional().isInt({ min: 5, max: 480 }).withMessage("Duration must be between 5 and 480 minutes."),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a non-negative number."),
  ],
  validate,
  adminController.createService
);
router.patch("/services/:id", adminController.updateService);

// ---- Appointments ----
router.get("/appointments", adminController.listAppointments);

module.exports = router;
