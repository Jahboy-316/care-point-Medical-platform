"use strict";

/**
 * Demo seed data — LOCAL/DEVELOPMENT USE ONLY.
 * These credentials are not secret and must not be used in production.
 * Passwords are hashed with bcrypt (rounds=12).
 *
 * Seeded accounts:
 *   admin@carepoint.demo    / Admin1234!
 *   dr.johnson@carepoint.demo / Provider1234!
 *   dr.okafor@carepoint.demo  / Provider1234!
 *   patient1@carepoint.demo  / Patient1234!
 *   patient2@carepoint.demo  / Patient1234!
 */

const bcrypt = require("bcryptjs");

const ROUNDS = 12;

async function hashPw(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

module.exports = {
  async up(queryInterface) {
    const [adminHash, providerHash, patientHash] = await Promise.all([
      hashPw("Admin1234!"),
      hashPw("Provider1234!"),
      hashPw("Patient1234!"),
    ]);

    const now = new Date();

    const users = [
      {
        id: "00000000-0000-0000-0000-000000000001",
        email: "admin@carepoint.demo",
        passwordHash: adminHash,
        role: "ADMIN",
        status: "ACTIVE",
        firstName: "System",
        lastName: "Admin",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "00000000-0000-0000-0000-000000000002",
        email: "dr.johnson@carepoint.demo",
        passwordHash: providerHash,
        role: "PROVIDER",
        status: "ACTIVE",
        firstName: "Sarah",
        lastName: "Johnson",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "00000000-0000-0000-0000-000000000003",
        email: "dr.okafor@carepoint.demo",
        passwordHash: providerHash,
        role: "PROVIDER",
        status: "ACTIVE",
        firstName: "Emeka",
        lastName: "Okafor",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "00000000-0000-0000-0000-000000000004",
        email: "patient1@carepoint.demo",
        passwordHash: patientHash,
        role: "PATIENT",
        status: "ACTIVE",
        firstName: "Alice",
        lastName: "Mensah",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "00000000-0000-0000-0000-000000000005",
        email: "patient2@carepoint.demo",
        passwordHash: patientHash,
        role: "PATIENT",
        status: "ACTIVE",
        firstName: "Ben",
        lastName: "Adeyemi",
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Insert with ON CONFLICT DO NOTHING so re-running the seeder is safe
    await queryInterface.sequelize.query(
      `INSERT INTO users (id, email, "passwordHash", role, status, "firstName", "lastName", "createdAt", "updatedAt")
       VALUES ${users.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ")}
       ON CONFLICT (id) DO NOTHING`,
      {
        replacements: users.flatMap((u) => [
          u.id, u.email, u.passwordHash, u.role, u.status, u.firstName, u.lastName, u.createdAt, u.updatedAt,
        ]),
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE id IN (
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000005'
      )`
    );
  },
};
