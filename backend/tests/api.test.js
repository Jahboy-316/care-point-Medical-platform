"use strict";

/**
 * Integration tests for the CarePoint API.
 *
 * Requirements:
 *   - NODE_ENV=test must be set
 *   - carepoint_test database must exist in PostgreSQL
 *   - Run: npm test
 *
 * Tests run with --runInBand so they are sequential and share DB state within each describe block.
 */

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret_that_is_at_least_64_characters_long_for_testing_only";
process.env.JWT_EXPIRES_IN = "1h";
process.env.BCRYPT_ROUNDS = "4"; // Low rounds for test speed

const request = require("supertest");
const app = require("../src/app");
const { sequelize } = require("../src/models");

// Sync DB (force drop/create) before all tests; close after
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

// ========== AUTH ==========

describe("POST /api/v1/auth/register", () => {
  it("registers a new patient and returns 201 with token", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testpatient@example.com",
      password: "Password1",
      firstName: "Test",
      lastName: "Patient",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe("PATIENT");
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("returns 422 for invalid email", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "not-an-email",
      password: "Password1",
      firstName: "A",
      lastName: "B",
    });
    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 for weak password", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "weak@example.com",
      password: "short",
      firstName: "A",
      lastName: "B",
    });
    expect(res.statusCode).toBe(422);
  });

  it("returns 409 for duplicate email (generic message)", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testpatient@example.com",
      password: "Password1",
      firstName: "Test",
      lastName: "Patient2",
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/v1/auth/login", () => {
  it("logs in with valid credentials and returns token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testpatient@example.com",
      password: "Password1",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it("returns 401 for invalid password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testpatient@example.com",
      password: "WrongPassword1",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for non-existent email", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "nobody@example.com",
      password: "Password1",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ========== AUTH/ME ==========

let patientToken;
let patientId;

describe("GET /api/v1/auth/me", () => {
  beforeAll(async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testpatient@example.com",
      password: "Password1",
    });
    patientToken = res.body.data.token;
    patientId = res.body.data.user.id;
  });

  it("returns current user for valid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe("testpatient@example.com");
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("returns 401 for missing token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 for invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalidtoken123");
    expect(res.statusCode).toBe(401);
  });
});

// ========== PATIENT PROFILE ==========

describe("PATCH /api/v1/patients/me", () => {
  it("updates patient profile with allowed fields", async () => {
    const res = await request(app)
      .patch("/api/v1/patients/me")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ phone: "+1-555-1234", dateOfBirth: "1990-01-01" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.patientProfile.phone).toBe("+1-555-1234");
  });

  it("rejects role field in payload (mass-assignment protection)", async () => {
    const res = await request(app)
      .patch("/api/v1/patients/me")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ role: "ADMIN" });
    expect(res.statusCode).toBe(422);
  });

  it("returns 401 without authentication", async () => {
    const res = await request(app).patch("/api/v1/patients/me").send({ phone: "123" });
    expect(res.statusCode).toBe(401);
  });
});

// ========== PROVIDERS (public) ==========

describe("GET /api/v1/providers", () => {
  it("returns a paginated list (may be empty before seed)", async () => {
    const res = await request(app).get("/api/v1/providers");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ========== SERVICES (public) ==========

describe("GET /api/v1/services", () => {
  it("returns a paginated list of active services", async () => {
    const res = await request(app).get("/api/v1/services");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ========== APPOINTMENTS ==========

describe("Appointment workflow", () => {
  let providerUserId;
  let providerToken;
  let serviceId;

  beforeAll(async () => {
    // Create a provider user directly via DB
    const { User, ProviderProfile, Service } = require("../src/models");
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("Provider1234!", 4);

    const providerUser = await User.create({
      email: "testprovider@example.com",
      passwordHash: hash,
      role: "PROVIDER",
      status: "ACTIVE",
      firstName: "Jane",
      lastName: "Provider",
    });
    providerUserId = providerUser.id;

    await ProviderProfile.create({ userId: providerUserId, isActive: true });

    const service = await Service.create({
      name: "Test Consultation",
      durationMinutes: 30,
      isActive: true,
    });
    serviceId = service.id;

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "testprovider@example.com",
      password: "Provider1234!",
    });
    providerToken = loginRes.body.data.token;
  });

  it("patient cannot create appointment in the past", async () => {
    const past = new Date(Date.now() - 3600000).toISOString();
    const res = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ providerId: providerUserId, startTime: past, serviceId });
    expect(res.statusCode).toBe(400);
  });

  let appointmentId;
  it("patient creates an appointment in the future", async () => {
    const future = new Date(Date.now() + 24 * 3600000).toISOString();
    const res = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patientToken}`)
      .send({ providerId: providerUserId, startTime: future, serviceId, reason: "Annual check-up" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe("REQUESTED");
    appointmentId = res.body.data.id;
  });

  it("patient can list their own appointments", async () => {
    const res = await request(app)
      .get("/api/v1/appointments")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("patient cannot see another patient's appointment via GET /:id", async () => {
    // Register a second patient
    await request(app).post("/api/v1/auth/register").send({
      email: "patient2test@example.com",
      password: "Password1",
      firstName: "B",
      lastName: "Patient",
    });
    const login2 = await request(app).post("/api/v1/auth/login").send({
      email: "patient2test@example.com",
      password: "Password1",
    });
    const token2 = login2.body.data.token;
    const res = await request(app)
      .get(`/api/v1/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${token2}`);
    // Should return 404 (not 403 — avoids info leak)
    expect(res.statusCode).toBe(404);
  });

  it("provider confirms the appointment", async () => {
    const res = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ status: "CONFIRMED" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("CONFIRMED");
  });

  it("invalid transition from CONFIRMED to REQUESTED is rejected", async () => {
    const res = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/status`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ status: "REQUESTED" });
    expect(res.statusCode).toBe(422); // fails validator
  });

  it("provider can cancel a confirmed appointment", async () => {
    const res = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ cancellationReason: "Provider unavailable" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  it("cannot cancel an already-cancelled appointment", async () => {
    const res = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({});
    expect(res.statusCode).toBe(409);
  });
});

// ========== ADMIN ==========

describe("Admin-only endpoints", () => {
  it("patient cannot access admin routes (403)", async () => {
    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// ========== SUSPENDED ACCOUNT ==========

describe("Suspended account restriction", () => {
  it("suspended user cannot access protected routes", async () => {
    // Register then suspend
    await request(app).post("/api/v1/auth/register").send({
      email: "suspended@example.com",
      password: "Password1",
      firstName: "Susp",
      lastName: "Ended",
    });
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "suspended@example.com",
      password: "Password1",
    });
    const suspToken = loginRes.body.data.token;
    const userId = loginRes.body.data.user.id;

    // Directly suspend in DB
    const { User } = require("../src/models");
    await User.update({ status: "SUSPENDED" }, { where: { id: userId } });

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${suspToken}`);
    expect(res.statusCode).toBe(403);
  });
});

// ========== NOT FOUND ==========

describe("Unknown routes", () => {
  it("returns 404 for unknown endpoint", async () => {
    const res = await request(app).get("/api/v1/nonexistent");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
