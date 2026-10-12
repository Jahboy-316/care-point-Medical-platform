"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProviderProfile extends Model {
    static associate(models) {
      ProviderProfile.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });
      ProviderProfile.belongsTo(models.Specialty, {
        foreignKey: "specialtyId",
        as: "specialty",
      });
      ProviderProfile.belongsToMany(models.Service, {
        through: models.ProviderService,
        foreignKey: "providerProfileId",
        otherKey: "serviceId",
        as: "services",
      });
      ProviderProfile.hasMany(models.Appointment, {
        foreignKey: "providerProfileId",
        as: "appointments",
      });
    }
  }

  ProviderProfile.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      specialtyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "specialties", key: "id" },
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "e.g. Dr., Prof.",
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      yearsOfExperience: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 0 },
      },
      // Availability stored as a simple text description; complex scheduling is out of scope
      availabilityNote: {
        type: DataTypes.STRING(500),
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
      modelName: "ProviderProfile",
      tableName: "provider_profiles",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["userId"] },
        { fields: ["specialtyId"] },
        { fields: ["isActive"] },
      ],
    }
  );

  return ProviderProfile;
};
