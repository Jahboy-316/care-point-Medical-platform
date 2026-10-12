"use strict";

const { Op } = require("sequelize");
const { User, ProviderProfile, Service, Appointment, Specialty, sequelize } = require("../models");
const { createError, parsePagination, paginatedResponse } = require("../utils/helpers");

// ---- Users ----

async function listUsers(query) {
  const { page, limit, offset } = parsePagination(query);
  const where = {};

  if (query.role) where.role = query.role.toUpperCase();
  if (query.status) where.status = query.status.toUpperCase();
  if (query.search) {
    where[Op.or] = [
      { firstName: { [Op.iLike]: `%${query.search}%` } },
      { lastName: { [Op.iLike]: `%${query.search}%` } },
      { email: { [Op.iLike]: `%${query.search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["passwordHash"] },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  return paginatedResponse(rows, count, page, limit);
}

async function getUserById(id) {
  const user = await User.findByPk(id, { attributes: { exclude: ["passwordHash"] } });
  if (!user) throw createError("User not found.", 404);
  return user;
}

async function updateUserStatus(id, status, adminId) {
  if (id === adminId) throw createError("You cannot change your own account status.", 400);

  const user = await User.findByPk(id);
  if (!user) throw createError("User not found.", 404);

  const validStatuses = ["ACTIVE", "INACTIVE", "SUSPENDED"];
  if (!validStatuses.includes(status)) throw createError("Invalid status value.", 400);

  await user.update({ status });
  return user.reload({ attributes: { exclude: ["passwordHash"] } });
}

// ---- Providers ----

async function listProvidersAdmin(query) {
  const { page, limit, offset } = parsePagination(query);
  const where = {};
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";

  const { count, rows } = await ProviderProfile.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: User, as: "user", attributes: { exclude: ["passwordHash"] } },
      { model: Specialty, as: "specialty" },
    ],
    distinct: true,
    order: [["createdAt", "DESC"]],
  });

  return paginatedResponse(rows, count, page, limit);
}

async function updateProviderStatus(id, isActive) {
  const profile = await ProviderProfile.findByPk(id);
  if (!profile) throw createError("Provider profile not found.", 404);
  await profile.update({ isActive });
  return profile;
}

// ---- Services ----

async function listServicesAdmin(query) {
  const { page, limit, offset } = parsePagination(query);
  const where = {};
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";

  const { count, rows } = await Service.findAndCountAll({ where, limit, offset, order: [["name", "ASC"]] });
  return paginatedResponse(rows, count, page, limit);
}

async function createService({ name, description, durationMinutes, price }) {
  const service = await Service.create({ name, description, durationMinutes: durationMinutes || 30, price: price || null });
  return service;
}

async function updateService(id, updates) {
  const service = await Service.findByPk(id);
  if (!service) throw createError("Service not found.", 404);
  const allowed = ["name", "description", "durationMinutes", "price", "isActive"];
  const data = {};
  allowed.forEach((f) => { if (Object.prototype.hasOwnProperty.call(updates, f)) data[f] = updates[f]; });
  await service.update(data);
  return service;
}

// ---- Appointments ----

async function listAppointmentsAdmin(query) {
  const { page, limit, offset } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status.toUpperCase();
  if (query.patientId) where.patientId = query.patientId;
  if (query.providerId) where.providerId = query.providerId;

  const { count, rows } = await Appointment.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: User, as: "patient", attributes: ["id", "firstName", "lastName", "email"] },
      { model: User, as: "provider", attributes: ["id", "firstName", "lastName", "email"] },
      { model: Service, as: "service", attributes: ["id", "name", "durationMinutes", "price"] },
    ],
    order: [["startTime", "DESC"]],
    distinct: true,
  });

  return paginatedResponse(rows, count, page, limit);
}

module.exports = {
  listUsers, getUserById, updateUserStatus,
  listProvidersAdmin, updateProviderStatus,
  listServicesAdmin, createService, updateService,
  listAppointmentsAdmin,
};
