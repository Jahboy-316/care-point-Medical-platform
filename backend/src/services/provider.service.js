"use strict";

const { Op } = require("sequelize");
const { ProviderProfile, User, Specialty, Service } = require("../models");
const { createError, parsePagination, paginatedResponse } = require("../utils/helpers");

async function listProviders(query) {
  const { page, limit, offset } = parsePagination(query);
  const where = { isActive: true };

  // Optional filter by specialty name
  const specialtyWhere = {};
  if (query.specialty) {
    specialtyWhere.name = { [Op.iLike]: `%${query.specialty}%` };
  }

  // Optional search across name and location via provider user
  const userWhere = {};
  if (query.search) {
    userWhere[Op.or] = [
      { firstName: { [Op.iLike]: `%${query.search}%` } },
      { lastName: { [Op.iLike]: `%${query.search}%` } },
    ];
  }

  const { count, rows } = await ProviderProfile.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email"],
        where: Object.keys(userWhere).length ? userWhere : undefined,
        required: Object.keys(userWhere).length > 0,
      },
      {
        model: Specialty,
        as: "specialty",
        where: Object.keys(specialtyWhere).length ? specialtyWhere : undefined,
        required: Object.keys(specialtyWhere).length > 0,
      },
      { model: Service, as: "services", through: { attributes: [] } },
    ],
    distinct: true,
    order: [["createdAt", "DESC"]],
  });

  return paginatedResponse(rows, count, page, limit);
}

async function getProviderById(id) {
  const provider = await ProviderProfile.findOne({
    where: { id, isActive: true },
    include: [
      { model: User, as: "user", attributes: ["id", "firstName", "lastName", "email"] },
      { model: Specialty, as: "specialty" },
      { model: Service, as: "services", through: { attributes: [] } },
    ],
  });
  if (!provider) throw createError("Provider not found.", 404);
  return provider;
}

module.exports = { listProviders, getProviderById };
