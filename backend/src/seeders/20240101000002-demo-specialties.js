"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const specialties = [
      { id: "10000000-0000-0000-0000-000000000001", name: "General Practice", description: "Primary healthcare and general medical consultations.", createdAt: now, updatedAt: now },
      { id: "10000000-0000-0000-0000-000000000002", name: "Cardiology", description: "Heart and cardiovascular system conditions.", createdAt: now, updatedAt: now },
      { id: "10000000-0000-0000-0000-000000000003", name: "Dermatology", description: "Skin, hair and nail conditions.", createdAt: now, updatedAt: now },
      { id: "10000000-0000-0000-0000-000000000004", name: "Pediatrics", description: "Medical care for infants, children and adolescents.", createdAt: now, updatedAt: now },
    ];

    await queryInterface.sequelize.query(
      `INSERT INTO specialties (id, name, description, "createdAt", "updatedAt")
       VALUES ${specialties.map(() => "(?, ?, ?, ?, ?)").join(", ")}
       ON CONFLICT (id) DO NOTHING`,
      { replacements: specialties.flatMap((s) => [s.id, s.name, s.description, s.createdAt, s.updatedAt]) }
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM specialties WHERE id LIKE '10000000-%'`
    );
  },
};
