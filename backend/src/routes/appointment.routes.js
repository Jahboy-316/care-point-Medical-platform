"use strict";

const router = require("express").Router();
const appointmentController = require("../controllers/appointment.controller");
const { authenticate, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createAppointmentRules,
  cancelAppointmentRules,
  updateStatusRules,
} = require("../validators/appointment.validator");

// All appointment routes require authentication
router.use(authenticate);

// Patients: create, list own, view own, cancel own
router.post(
  "/",
  requireRole("PATIENT"),
  createAppointmentRules,
  validate,
  appointmentController.createAppointment
);

// List: patients see theirs, providers see theirs
router.get(
  "/",
  requireRole("PATIENT", "PROVIDER"),
  appointmentController.listAppointments
);

// Get single appointment (role-scoped in service)
router.get(
  "/:id",
  requireRole("PATIENT", "PROVIDER", "ADMIN"),
  appointmentController.getAppointment
);

// Patient cancels their own appointment
router.patch(
  "/:id/cancel",
  requireRole("PATIENT", "PROVIDER", "ADMIN"),
  cancelAppointmentRules,
  validate,
  appointmentController.cancelAppointment
);

// Provider/Admin updates status (CONFIRMED, COMPLETED, REJECTED, CANCELLED)
router.patch(
  "/:id/status",
  requireRole("PROVIDER", "ADMIN"),
  updateStatusRules,
  validate,
  appointmentController.updateAppointmentStatus
);

module.exports = router;
