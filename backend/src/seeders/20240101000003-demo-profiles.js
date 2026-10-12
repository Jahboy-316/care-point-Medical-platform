"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const profiles = [
      {
        id: "20000000-0000-0000-0000-000000000001",
        userId: "00000000-0000-0000-0000-000000000002",
        specialtyId: "10000000-0000-0000-0000-000000000001",
        title: "Dr.",
        bio: "Demo provider: Dr. Sarah Johnson — General Practitioner with 10 years of experience. This is demo/seed data only.",
        phone: "+1-555-0100",
        location: "Lagos, Nigeria",
        yearsOfExperience: 10,
        availabilityNote: "Mon–Fri, 08:00–17:00 WAT",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "20000000-0000-0000-0000-000000000002",
        userId: "00000000-0000-0000-0000-000000000003",
        specialtyId: "10000000-0000-0000-0000-000000000002",
        title: "Dr.",
        bio: "Demo provider: Dr. Emeka Okafor — Cardiologist. This is demo/seed data only.",
        phone: "+1-555-0200",
        location: "Abuja, Nigeria",
        yearsOfExperience: 15,
        availabilityNote: "Mon, Wed, Fri, 09:00–16:00 WAT",
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.sequelize.query(
      `INSERT INTO provider_profiles (id, "userId", "specialtyId", title, bio, phone, location, "yearsOfExperience", "availabilityNote", "isActive", "createdAt", "updatedAt")
       VALUES ${profiles.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ")}
       ON CONFLICT (id) DO NOTHING`,
      {
        replacements: profiles.flatMap((p) => [
          p.id, p.userId, p.specialtyId, p.title, p.bio, p.phone,
          p.location, p.yearsOfExperience, p.availabilityNote, p.isActive, p.createdAt, p.updatedAt,
        ]),
      }
    );

    // Patient profiles
    const patientProfiles = [
      {
        id: "30000000-0000-0000-0000-000000000001",
        userId: "00000000-0000-0000-0000-000000000004",
        phone: "+1-555-1001",
        dateOfBirth: "1990-05-15",
        address: "12 Broad St, Lagos",
        emergencyContactName: "Kwame Mensah",
        emergencyContactPhone: "+1-555-1002",
        emergencyContactRelationship: "Spouse",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "30000000-0000-0000-0000-000000000002",
        userId: "00000000-0000-0000-0000-000000000005",
        phone: "+1-555-2001",
        dateOfBirth: "1985-11-22",
        address: "45 Victoria Island, Lagos",
        emergencyContactName: null,
        emergencyContactPhone: null,
        emergencyContactRelationship: null,
        createdAt: now,
        updatedAt: now,
      },
    ];

    await queryInterface.sequelize.query(
      `INSERT INTO patient_profiles (id, "userId", phone, "dateOfBirth", address, "emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship", "createdAt", "updatedAt")
       VALUES ${patientProfiles.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ")}
       ON CONFLICT (id) DO NOTHING`,
      {
        replacements: patientProfiles.flatMap((p) => [
          p.id, p.userId, p.phone, p.dateOfBirth, p.address,
          p.emergencyContactName, p.emergencyContactPhone, p.emergencyContactRelationship, p.createdAt, p.updatedAt,
        ]),
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`DELETE FROM provider_profiles WHERE id LIKE '20000000-%'`);
    await queryInterface.sequelize.query(`DELETE FROM patient_profiles WHERE id LIKE '30000000-%'`);
  },
};
