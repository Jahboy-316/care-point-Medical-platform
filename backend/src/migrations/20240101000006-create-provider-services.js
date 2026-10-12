"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("provider_services", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },
      providerProfileId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "provider_profiles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      serviceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "services", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });

    await queryInterface.addIndex("provider_services", ["providerProfileId", "serviceId"], {
      unique: true,
      name: "provider_services_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("provider_services");
  },
};
