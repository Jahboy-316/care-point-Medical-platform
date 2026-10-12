const { Sequelize } = require("sequelize");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";
const dbConfig = require("./database")[env];

let sequelize;

if (dbConfig.url) {
  sequelize = new Sequelize(dbConfig.url, {
    dialect: "postgres",
    dialectOptions: dbConfig.dialectOptions || {},
    logging: dbConfig.logging !== undefined ? dbConfig.logging : false,
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port || 5432,
      dialect: "postgres",
      dialectOptions: dbConfig.dialectOptions || {},
      logging: dbConfig.logging !== undefined ? dbConfig.logging : false,
      pool: dbConfig.pool || { max: 5, min: 0, acquire: 30000, idle: 10000 },
    }
  );
}

module.exports = sequelize;
