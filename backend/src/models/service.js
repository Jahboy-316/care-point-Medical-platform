"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.belongsToMany(models.ProviderProfile, {
        through: models.ProviderService,
        foreignKey: "serviceId",
        otherKey: "providerProfileId",
        as: "providers",
      });
      Service.hasMany(models.Appointment, {
        foreignKey: "serviceId",
        as: "appointments",
      });
    }
  }

  Service.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Duration in minutes — explicit as required by spec
      durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
        validate: { min: 5, max: 480 },
      },
      // Price in major currency units (e.g. USD). Nullable if not applicable.
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Service",
      tableName: "services",
      timestamps: true,
      indexes: [{ fields: ["isActive"] }, { fields: ["name"] }],
    }
  );

  return Service;
};
