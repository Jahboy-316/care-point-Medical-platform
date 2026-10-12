"use strict";

require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models");

const PORT = parseInt(process.env.PORT, 10) || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
  } catch (err) {
    console.error("Unable to connect to the database:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`CarePoint API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
}

start();
