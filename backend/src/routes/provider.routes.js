"use strict";

const router = require("express").Router();
const providerController = require("../controllers/provider.controller");

// Provider listing and details are public
router.get("/", providerController.listProviders);
router.get("/:id", providerController.getProvider);

module.exports = router;
