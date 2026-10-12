"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("appointments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      patientId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      providerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      providerProfileId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "provider_profiles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      serviceId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "services", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      appointmentDurationMinutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      status: {
        type: Sequelize.ENUM("REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"),
        allowNull: false,
        defaultValue: "REQUESTED",
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      cancelledBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      cancellationReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      rejectionNote: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("appointments", ["patientId"], { name: "appointments_patient_idx" });
    await queryInterface.addIndex("appointments", ["providerId"], { name: "appointments_provider_idx" });
    await queryInterface.addIndex("appointments", ["status"], { name: "appointments_status_idx" });
    await queryInterface.addIndex("appointments", ["startTime"], { name: "appointments_starttime_idx" });
    await queryInterface.addIndex("appointments", ["patientId", "status"], { name: "appointments_patient_status_idx" });
    await queryInterface.addIndex("appointments", ["providerId", "status"], { name: "appointments_provider_status_idx" });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("appointments");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_appointments_status";');
  },
};
