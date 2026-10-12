"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class PatientProfile extends Model {
    static associate(models) {
      PatientProfile.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });
    }
  }

  PatientProfile.init(
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
      phone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      // Emergency contact fields stored flat — simple and sufficient for scope
      emergencyContactName: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      emergencyContactPhone: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      emergencyContactRelationship: {
        type: DataTypes.STRING(80),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PatientProfile",
      tableName: "patient_profiles",
      timestamps: true,
      indexes: [{ unique: true, fields: ["userId"] }],
    }
  );

  return PatientProfile;
};
