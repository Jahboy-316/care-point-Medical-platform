"use strict";

const providerService = require("../services/provider.service");

async function listProviders(req, res, next) {
  try {
    const result = await providerService.listProviders(req.query);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getProvider(req, res, next) {
  try {
    const provider = await providerService.getProviderById(req.params.id);
    return res.status(200).json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProviders, getProvider };
