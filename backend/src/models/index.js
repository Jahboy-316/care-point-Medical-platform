"use strict";

const { Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize");

// Import all models
const User = require("./user")(sequelize, Sequelize.DataTypes);
const PatientProfile = require("./patientProfile")(sequelize, Sequelize.DataTypes);
const ProviderProfile = require("./providerProfile")(sequelize, Sequelize.DataTypes);
const Specialty = require("./specialty")(sequelize, Sequelize.DataTypes);
const Service = require("./service")(sequelize, Sequelize.DataTypes);
const ProviderService = require("./providerService")(sequelize, Sequelize.DataTypes);
const Appointment = require("./appointment")(sequelize, Sequelize.DataTypes);

const db = {
  sequelize,
  Sequelize,
  User,
  PatientProfile,
  ProviderProfile,
  Specialty,
  Service,
  ProviderService,
  Appointment,
};

// Run associations
Object.values(db).forEach((model) => {
  if (model && typeof model.associate === "function") {
    model.associate(db);
  }
});

module.exports = db;
