"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Specialty extends Model {
    static associate(models) {
      Specialty.hasMany(models.ProviderProfile, {
        foreignKey: "specialtyId",
        as: "providers",
      });
    }
  }

  Specialty.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Specialty",
      tableName: "specialties",
      timestamps: true,
      indexes: [{ unique: true, fields: ["name"] }],
    }
  );

  return Specialty;
};
