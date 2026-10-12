"use strict";

const { Op } = require("sequelize");
const { Appointment, ProviderProfile, Service, User, sequelize } = require("../models");
const { createError, parsePagination, paginatedResponse } = require("../utils/helpers");

// All times are UTC. Clients must send UTC ISO 8601.
const TIMEZONE_NOTE = "All appointment times are in UTC.";

// How many minutes before a confirmed appointment a patient can still cancel
const PATIENT_CANCEL_CUTOFF_MINUTES = 60;

async function createAppointment({ patientId, providerId, serviceId, startTime, reason }) {
  // Prevent booking in the past
  const now = new Date();
  if (startTime <= now) {
    throw createError("Appointment start time must be in the future.", 400);
  }

  // Load the provider profile
  const providerProfile = await ProviderProfile.findOne({
    where: { userId: providerId, isActive: true },
  });
  if (!providerProfile) {
    throw createError("Provider not found or is not currently accepting appointments.", 404);
  }

  // Load service and determine duration
  let durationMinutes = 30;
  if (serviceId) {
    const service = await Service.findOne({ where: { id: serviceId, isActive: true } });
    if (!service) throw createError("Service not found or is inactive.", 404);
    durationMinutes = service.durationMinutes;
  }

  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  // Use a serializable transaction to prevent double-booking
  const appointment = await sequelize.transaction(
    { isolationLevel: "SERIALIZABLE" },
    async (t) => {
      // Check for overlapping active appointments with the same provider
      const conflict = await Appointment.findOne({
        where: {
          providerId,
          status: { [Op.in]: ["REQUESTED", "CONFIRMED"] },
          [Op.or]: [
            // New appointment overlaps an existing one
            { startTime: { [Op.lt]: endTime }, endTime: { [Op.gt]: startTime } },
          ],
        },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (conflict) {
        throw createError(
          "This time slot is unavailable. The provider already has an appointment during this period.",
          409
        );
      }

      return Appointment.create(
        {
          patientId,
          providerId,
          providerProfileId: providerProfile.id,
          serviceId: serviceId || null,
          startTime,
          endTime,
          appointmentDurationMinutes: durationMinutes,
          status: "REQUESTED",
          reason: reason || null,
        },
        { transaction: t }
      );
    }
  );

  return loadAppointmentDetails(appointment.id);
}

async function listAppointmentsForPatient(patientId, query) {
  const { page, limit, offset } = parsePagination(query);
  const where = { patientId };

  if (query.status) {
    where.status = query.status.toUpperCase();
  }

  const { count, rows } = await Appointment.findAndCountAll({
    where,
    limit,
    offset,
    include: appointmentIncludes(),
    order: [["startTime", "DESC"]],
    distinct: true,
  });

  return paginatedResponse(rows, count, page, limit);
}

async function listAppointmentsForProvider(providerId, query) {
  const { page, limit, offset } = parsePagination(query);
  const where = { providerId };

  if (query.status) {
    where.status = query.status.toUpperCase();
  }

  const { count, rows } = await Appointment.findAndCountAll({
    where,
    limit,
    offset,
    include: appointmentIncludes(),
    order: [["startTime", "ASC"]],
    distinct: true,
  });

  return paginatedResponse(rows, count, page, limit);
}

async function getAppointmentById(id, requestingUser) {
  const appointment = await loadAppointmentDetails(id);
  if (!appointment) throw createError("Appointment not found.", 404);

  // Authorization: patient sees only their own; provider sees only theirs; admin sees all
  if (requestingUser.role === "PATIENT" && appointment.patientId !== requestingUser.id) {
    throw createError("Appointment not found.", 404); // intentional 404 to avoid info leak
  }
  if (requestingUser.role === "PROVIDER" && appointment.providerId !== requestingUser.id) {
    throw createError("Appointment not found.", 404);
  }

  return appointment;
}

async function cancelAppointment(id, requestingUser, cancellationReason) {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) throw createError("Appointment not found.", 404);

  // Ownership check
  if (requestingUser.role === "PATIENT" && appointment.patientId !== requestingUser.id) {
    throw createError("Appointment not found.", 404);
  }
  if (requestingUser.role === "PROVIDER" && appointment.providerId !== requestingUser.id) {
    throw createError("Appointment not found.", 404);
  }

  if (!appointment.canTransitionTo("CANCELLED")) {
    throw createError(`Cannot cancel an appointment with status '${appointment.status}'.`, 409);
  }

  // Patients cannot cancel a confirmed appointment within the cutoff window
  if (
    requestingUser.role === "PATIENT" &&
    appointment.status === "CONFIRMED"
  ) {
    const minutesUntilStart = (appointment.startTime - new Date()) / 60000;
    if (minutesUntilStart < PATIENT_CANCEL_CUTOFF_MINUTES) {
      throw createError(
        `Appointments cannot be cancelled within ${PATIENT_CANCEL_CUTOFF_MINUTES} minutes of the start time. Please contact your provider.`,
        409
      );
    }
  }

  const now = new Date();
  await appointment.update({
    status: "CANCELLED",
    cancelledAt: now,
    cancelledBy: requestingUser.id,
    cancellationReason: cancellationReason || null,
  });

  return loadAppointmentDetails(appointment.id);
}

async function updateAppointmentStatus(id, requestingUser, { status, rejectionNote, cancellationReason }) {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) throw createError("Appointment not found.", 404);

  // Providers can only act on their own appointments
  if (requestingUser.role === "PROVIDER" && appointment.providerId !== requestingUser.id) {
    throw createError("Appointment not found.", 404);
  }

  if (!appointment.canTransitionTo(status)) {
    throw createError(
      `Cannot transition appointment from '${appointment.status}' to '${status}'.`,
      409
    );
  }

  const updates = { status };
  const now = new Date();

  if (status === "CANCELLED") {
    updates.cancelledAt = now;
    updates.cancelledBy = requestingUser.id;
    updates.cancellationReason = cancellationReason || null;
  }

  if (status === "REJECTED") {
    updates.rejectionNote = rejectionNote || null;
  }

  if (status === "COMPLETED") {
    updates.completedAt = now;
  }

  await appointment.update(updates);
  return loadAppointmentDetails(appointment.id);
}

// ---- Helpers ----

function appointmentIncludes() {
  return [
    { model: User, as: "patient", attributes: ["id", "firstName", "lastName", "email"] },
    { model: User, as: "provider", attributes: ["id", "firstName", "lastName", "email"] },
    { model: Service, as: "service", attributes: ["id", "name", "durationMinutes", "price"] },
  ];
}

async function loadAppointmentDetails(id) {
  return Appointment.findByPk(id, { include: appointmentIncludes() });
}

module.exports = {
  createAppointment,
  listAppointmentsForPatient,
  listAppointmentsForProvider,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  TIMEZONE_NOTE,
};
