"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const services = [
      {
        id: "40000000-0000-0000-0000-000000000001",
        name: "General Consultation",
        description: "Standard 30-minute consultation for general health concerns.",
        durationMinutes: 30,
        price: 5000.00,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "40000000-0000-0000-0000-000000000002",
        name: "Follow-up Consultation",
        description: "15-minute follow-up for existing patients.",
        durationMinutes: 15,
        price: 2500.00,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "40000000-0000-0000-0000-000000000003",
        name: "Cardiac Assessment",
        description: "Comprehensive 60-minute cardiac evaluation and ECG review.",
        durationMinutes: 60,
        price: 15000.00,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "40000000-0000-0000-0000-000000000004",
        name: "Blood Pressure Check",
        description: "Quick 15-minute blood pressure monitoring and review.",
        durationMinutes: 15,
        price: 1500.00,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.sequelize.query(
      `INSERT INTO services (id, name, description, "durationMinutes", price, "isActive", "createdAt", "updatedAt")
       VALUES ${services.map(() => "(?, ?, ?, ?, ?, ?, ?, ?)").join(", ")}
       ON CONFLICT (id) DO NOTHING`,
      {
        replacements: services.flatMap((s) => [
          s.id, s.name, s.description, s.durationMinutes, s.price, s.isActive, s.createdAt, s.updatedAt,
        ]),
      }
    );

    // Link provider profiles to their services
    const providerServices = [
      { id: "50000000-0000-0000-0000-000000000001", providerProfileId: "20000000-0000-0000-0000-000000000001", serviceId: "40000000-0000-0000-0000-000000000001" },
      { id: "50000000-0000-0000-0000-000000000002", providerProfileId: "20000000-0000-0000-0000-000000000001", serviceId: "40000000-0000-0000-0000-000000000002" },
      { id: "50000000-0000-0000-0000-000000000003", providerProfileId: "20000000-0000-0000-0000-000000000002", serviceId: "40000000-0000-0000-0000-000000000003" },
      { id: "50000000-0000-0000-0000-000000000004", providerProfileId: "20000000-0000-0000-0000-000000000002", serviceId: "40000000-0000-0000-0000-000000000004" },
    ];

    await queryInterface.sequelize.query(
      `INSERT INTO provider_services (id, "providerProfileId", "serviceId")
       VALUES ${providerServices.map(() => "(?, ?, ?)").join(", ")}
       ON CONFLICT (id) DO NOTHING`,
      {
        replacements: providerServices.flatMap((ps) => [ps.id, ps.providerProfileId, ps.serviceId]),
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DELETE FROM provider_services WHERE id LIKE '50000000-%'`);
    await queryInterface.sequelize.query(`DELETE FROM services WHERE id LIKE '40000000-%'`);
  },
};
