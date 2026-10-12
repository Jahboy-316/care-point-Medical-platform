"use strict";

const serviceService = require("../services/service.service");

async function listServices(req, res, next) {
  try {
    const result = await serviceService.listServices(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getService(req, res, next) {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    return res.status(200).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
}

module.exports = { listServices, getService };
