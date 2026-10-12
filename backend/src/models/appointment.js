"use strict";

const { Model } = require("sequelize");

// Appointment lifecycle statuses
const STATUSES = ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"];

// Valid transitions: maps current status → allowed next statuses
// Provider/Admin can CONFIRM or REJECT a REQUESTED appointment.
// Provider/Admin can mark CONFIRMED as COMPLETED.
// Patient/Provider/Admin can CANCEL a REQUESTED or CONFIRMED appointment.
const VALID_TRANSITIONS = {
  REQUESTED: ["CONFIRMED", "CANCELLED", "REJECTED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.User, {
        foreignKey: "patientId",
        as: "patient",
      });
      Appointment.belongsTo(models.User, {
        foreignKey: "providerId",
        as: "provider",
      });
      Appointment.belongsTo(models.ProviderProfile, {
        foreignKey: "providerProfileId",
        as: "providerProfile",
      });
      Appointment.belongsTo(models.Service, {
        foreignKey: "serviceId",
        as: "service",
      });
    }

    canTransitionTo(newStatus) {
      const allowed = VALID_TRANSITIONS[this.status] || [];
      return allowed.includes(newStatus);
    }
  }

  Appointment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      patientId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      // Provider user account
      providerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      // Provider profile (for eager-loading profile details)
      providerProfileId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "provider_profiles", key: "id" },
      },
      serviceId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: "services", key: "id" },
      },
      // All times stored as UTC; clients should send UTC
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      // Derived from startTime + service.durationMinutes or appointmentDurationMinutes
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      // Duration stored explicitly so it remains stable even if service duration changes
      appointmentDurationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      status: {
        type: DataTypes.ENUM(...STATUSES),
        allowNull: false,
        defaultValue: "REQUESTED",
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Cancellation metadata
      cancelledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelledBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      cancellationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Rejection note (provider/admin)
      rejectionNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Completed timestamp
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Appointment",
      tableName: "appointments",
      timestamps: true,
      indexes: [
        { fields: ["patientId"] },
        { fields: ["providerId"] },
        { fields: ["status"] },
        { fields: ["startTime"] },
        { fields: ["patientId", "status"] },
        { fields: ["providerId", "status"] },
      ],
    }
  );

  Appointment.STATUSES = STATUSES;
  Appointment.VALID_TRANSITIONS = VALID_TRANSITIONS;

  return Appointment;
};
