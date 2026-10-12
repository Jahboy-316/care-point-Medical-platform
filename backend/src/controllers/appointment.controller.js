"use strict";

const appointmentService = require("../services/appointment.service");

async function createAppointment(req, res, next) {
  try {
    const { providerId, serviceId, startTime, reason } = req.body;
    const appointment = await appointmentService.createAppointment({
      patientId: req.user.id,
      providerId,
      serviceId,
      startTime,
      reason,
    });
    return res.status(201).json({
      success: true,
      message: "Appointment requested successfully.",
      data: appointment,
    });
  } catch (err) {
    next(err);
  }
}

async function listAppointments(req, res, next) {
  try {
    let result;
    if (req.user.role === "PATIENT") {
      result = await appointmentService.listAppointmentsForPatient(req.user.id, req.query);
    } else if (req.user.role === "PROVIDER") {
      result = await appointmentService.listAppointmentsForProvider(req.user.id, req.query);
    } else {
      // ADMIN — handled by admin routes; shouldn't reach here
      result = await appointmentService.listAppointmentsForPatient(req.user.id, req.query);
    }
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getAppointment(req, res, next) {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id, req.user);
    return res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
}

async function cancelAppointment(req, res, next) {
  try {
    const { cancellationReason } = req.body;
    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      req.user,
      cancellationReason
    );
    return res.status(200).json({ success: true, message: "Appointment cancelled.", data: appointment });
  } catch (err) {
    next(err);
  }
}

// Provider/Admin status update
async function updateAppointmentStatus(req, res, next) {
  try {
    const { status, rejectionNote, cancellationReason } = req.body;
    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id,
      req.user,
      { status, rejectionNote, cancellationReason }
    );
    return res.status(200).json({ success: true, message: "Appointment status updated.", data: appointment });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAppointment,
  listAppointments,
  getAppointment,
  cancelAppointment,
  updateAppointmentStatus,
};
