"use strict";

const adminService = require("../services/admin.service");

// ---- Users ----
async function listUsers(req, res, next) {
  try {
    const result = await adminService.listUsers(req.query);
    return res.status(200).json(result);
  } catch (err) { next(err); }
}

async function getUser(req, res, next) {
  try {
    const user = await adminService.getUserById(req.params.id);
    return res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
}

async function updateUserStatus(req, res, next) {
  try {
    const user = await adminService.updateUserStatus(req.params.id, req.body.status, req.user.id);
    return res.status(200).json({ success: true, message: "User status updated.", data: user });
  } catch (err) { next(err); }
}

// ---- Providers ----
async function listProviders(req, res, next) {
  try {
    const result = await adminService.listProvidersAdmin(req.query);
    return res.status(200).json(result);
  } catch (err) { next(err); }
}

async function updateProviderStatus(req, res, next) {
  try {
    const { isActive } = req.body;
    const profile = await adminService.updateProviderStatus(req.params.id, isActive);
    return res.status(200).json({ success: true, message: "Provider status updated.", data: profile });
  } catch (err) { next(err); }
}

// ---- Services ----
async function listServices(req, res, next) {
  try {
    const result = await adminService.listServicesAdmin(req.query);
    return res.status(200).json(result);
  } catch (err) { next(err); }
}

async function createService(req, res, next) {
  try {
    const service = await adminService.createService(req.body);
    return res.status(201).json({ success: true, message: "Service created.", data: service });
  } catch (err) { next(err); }
}

async function updateService(req, res, next) {
  try {
    const service = await adminService.updateService(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Service updated.", data: service });
  } catch (err) { next(err); }
}

// ---- Appointments ----
async function listAppointments(req, res, next) {
  try {
    const result = await adminService.listAppointmentsAdmin(req.query);
    return res.status(200).json(result);
  } catch (err) { next(err); }
}

module.exports = {
  listUsers, getUser, updateUserStatus,
  listProviders, updateProviderStatus,
  listServices, createService, updateService,
  listAppointments,
};
