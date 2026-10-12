"use strict";

const { User, PatientProfile } = require("../models");
const { createError } = require("../utils/helpers");

// Only these fields can be updated by the patient
const ALLOWED_FIELDS = [
  "phone",
  "dateOfBirth",
  "address",
  "emergencyContactName",
  "emergencyContactPhone",
  "emergencyContactRelationship",
];

async function getPatientProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["passwordHash"] },
    include: [{ association: "patientProfile" }],
  });
  if (!user) throw createError("Patient not found.", 404);
  return user;
}

async function updatePatientProfile(userId, body) {
  // Explicitly pick only allowed fields — prevents mass-assignment
  const profileData = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      profileData[field] = body[field];
    }
  });

  const [profile] = await PatientProfile.findOrCreate({
    where: { userId },
    defaults: { userId },
  });

  await profile.update(profileData);

  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ["passwordHash"] },
    include: [{ association: "patientProfile" }],
  });

  return updatedUser;
}

module.exports = { getPatientProfile, updatePatientProfile };
