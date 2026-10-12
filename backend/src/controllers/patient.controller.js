"use strict";

const patientService = require("../services/patient.service");

async function getMyProfile(req, res, next) {
  try {
    const user = await patientService.getPatientProfile(req.user.id);
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const user = await patientService.updatePatientProfile(req.user.id, req.body);
    return res.status(200).json({ success: true, message: "Profile updated.", data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyProfile, updateMyProfile };
