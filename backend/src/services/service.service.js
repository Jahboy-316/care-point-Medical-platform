"use strict";

const { Op } = require("sequelize");
const { Service } = require("../models");
const { createError, parsePagination, paginatedResponse } = require("../utils/helpers");

async function listServices(query) {
  const { page, limit, offset } = parsePagination(query);
  const where = { isActive: true };

  if (query.search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${query.search}%` } },
      { description: { [Op.iLike]: `%${query.search}%` } },
    ];
  }

  const { count, rows } = await Service.findAndCountAll({
    where,
    limit,
    offset,
    order: [["name", "ASC"]],
  });

  return paginatedResponse(rows, count, page, limit);
}

async function getServiceById(id) {
  const service = await Service.findOne({ where: { id, isActive: true } });
  if (!service) throw createError("Service not found.", 404);
  return service;
}

module.exports = { listServices, getServiceById };
