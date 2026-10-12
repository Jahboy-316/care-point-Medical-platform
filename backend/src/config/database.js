require("dotenv").config();

const env = process.env.NODE_ENV || "development";

function buildDialectOptions() {
  if (process.env.DATABASE_URL && (process.env.NODE_ENV === "production" || process.env.DATABASE_URL.includes("sslmode=require"))) {
    return { ssl: { require: true, rejectUnauthorized: false } };
  }
  return {};
}

function getConnectionConfig(overrideDatabase) {
  // If test environment and DATABASE_URL_TEST is defined, use it
  if (env === "test" && process.env.DATABASE_URL_TEST) {
    return {
      url: process.env.DATABASE_URL_TEST,
      dialect: "postgres",
      dialectOptions: buildDialectOptions(),
    };
  }

  // If DATABASE_URL is defined, use it
  if (process.env.DATABASE_URL && env !== "test") {
    return {
      url: process.env.DATABASE_URL,
      dialect: "postgres",
      dialectOptions: buildDialectOptions(),
    };
  }

  // If in test environment and using DATABASE_URL, replace database name in the connection string if override provided
  if (env === "test" && process.env.DATABASE_URL) {
    try {
      const parsedUrl = new URL(process.env.DATABASE_URL);
      parsedUrl.pathname = `/${overrideDatabase || process.env.DB_NAME_TEST || "carepoint_test"}`;
      return {
        url: parsedUrl.toString(),
        dialect: "postgres",
        dialectOptions: buildDialectOptions(),
      };
    } catch {
      // fallback
    }
  }

  // Fallback to discrete variables
  return {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || null,
    database: overrideDatabase || process.env.DB_NAME || "carepoint_dev",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    dialectOptions: buildDialectOptions(),
  };
}

const config = {
  development: {
    ...getConnectionConfig(),
    logging: false,
  },
  test: {
    ...getConnectionConfig(process.env.DB_NAME_TEST || "carepoint_test"),
    logging: false,
  },
  production: {
    ...getConnectionConfig(),
    logging: false,
    pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
  },
};

module.exports = config;
