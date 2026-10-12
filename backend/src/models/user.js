"use strict";

const { Model } = require("sequelize");

// Valid roles and account statuses
const ROLES = ["PATIENT", "PROVIDER", "ADMIN"];
const STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"];

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.PatientProfile, {
        foreignKey: "userId",
        as: "patientProfile",
        onDelete: "CASCADE",
      });
      User.hasOne(models.ProviderProfile, {
        foreignKey: "userId",
        as: "providerProfile",
        onDelete: "CASCADE",
      });
      User.hasMany(models.Appointment, {
        foreignKey: "patientId",
        as: "patientAppointments",
      });
      User.hasMany(models.Appointment, {
        foreignKey: "providerId",
        as: "providerAppointments",
      });
    }

    // Never expose the password hash in serialized output
    toJSON() {
      const values = { ...this.get() };
      delete values.passwordHash;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
        set(value) {
          // Normalize email to lowercase
          this.setDataValue("email", value ? value.toLowerCase().trim() : value);
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...ROLES),
        allowNull: false,
        defaultValue: "PATIENT",
      },
      status: {
        type: DataTypes.ENUM(...STATUSES),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [1, 100] },
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: true, len: [1, 100] },
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["email"] },
        { fields: ["role"] },
        { fields: ["status"] },
      ],
    }
  );

  User.ROLES = ROLES;
  User.STATUSES = STATUSES;

  return User;
};
