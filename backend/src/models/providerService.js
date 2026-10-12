"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProviderService extends Model {
    static associate(models) {
      // Junction table — no extra associations needed
    }
  }

  ProviderService.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      providerProfileId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "provider_profiles", key: "id" },
        onDelete: "CASCADE",
      },
      serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "services", key: "id" },
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "ProviderService",
      tableName: "provider_services",
      timestamps: false,
      indexes: [
        { unique: true, fields: ["providerProfileId", "serviceId"] },
      ],
    }
  );

  return ProviderService;
};
