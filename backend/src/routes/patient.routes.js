"use strict";

const router = require("express").Router();
const patientController = require("../controllers/patient.controller");
const { authenticate, requireRole } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { updatePatientProfileRules } = require("../validators/patient.validator");

// All patient profile routes require authentication and PATIENT role
router.use(authenticate, requireRole("PATIENT"));

router.get("/me", patientController.getMyProfile);
router.patch("/me", updatePatientProfileRules, validate, patientController.updateMyProfile);

module.exports = router;
