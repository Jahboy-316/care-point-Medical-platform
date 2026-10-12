"use strict";

const router = require("express").Router();
const serviceController = require("../controllers/service.controller");

// Service listing and details are public
router.get("/", serviceController.listServices);
router.get("/:id", serviceController.getService);

module.exports = router;
