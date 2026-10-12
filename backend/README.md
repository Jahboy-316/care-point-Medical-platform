# CarePoint REST API

A secure, modular REST API built for **CarePoint**, a patient-facing healthcare services platform.

Built with Node.js, Express, PostgreSQL, and Sequelize ORM adhering to the backend technical specification.

---

## 1. Tech Stack & Dependencies

- **Runtime**: Node.js v24+ (CommonJS)
- **Framework**: Express.js 4.19
- **Database**: PostgreSQL 18 with `pg` / `pg-hstore` driver
- **ORM**: Sequelize 6.37 + Sequelize CLI 6.6
- **Auth**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` (work factor 12)
- **Security & Middleware**: `helmet`, `cors`, `express-rate-limit`, `express-validator`, `morgan`
- **Testing**: Jest 29 + Supertest 7

---

## 2. Supported Roles & Permissions

| Role | Description | Permissions |
|---|---|---|
| `PATIENT` | General patient user | Self-registration, update own profile, discover providers/services, create appointment requests, view own appointments, cancel own appointments within allowable timeframe. |
| `PROVIDER` | Clinician / Healthcare professional | View assigned appointments, confirm/reject requests, complete or cancel appointments, manage availability. |
| `ADMIN` | System administrator | Manage users (activate/deactivate/suspend), manage provider profiles, manage services catalogue, oversee all appointments. No public route can assign this role. |

### Account Statuses
- `ACTIVE`: Normal access.
- `INACTIVE`: Account deactivated; blocked from performing authenticated actions.
- `SUSPENDED`: Suspended account; blocked from performing authenticated actions.

---

## 3. Architecture & Project Layout

```
backend/
├── config/
│   └── config.json              # Fallback Sequelize CLI configuration
├── src/
│   ├── app.js                   # Express app configuration & middleware
│   ├── server.js                # Database connection check & server boot
│   ├── config/
│   │   ├── database.js          # Environment-aware DB connection config
│   │   └── sequelize.js         # Initialized Sequelize instance
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── appointment.controller.js
│   │   ├── auth.controller.js
│   │   ├── patient.controller.js
│   │   ├── provider.controller.js
│   │   └── service.controller.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification & role authorization
│   │   ├── errorHandler.js      # Centralized error handler
│   │   └── validate.js          # Express-validator response transformer
│   ├── migrations/              # Database schema migrations
│   ├── models/                  # Sequelize data models
│   ├── routes/                  # Express route definitions
│   ├── seeders/                 # Realistic idempotent demo seeders
│   ├── services/                # Business logic & transaction handling
│   ├── utils/                   # Helpers, errors, pagination
│   └── validators/              # Input validation schemas
├── tests/
│   └── api.test.js              # Integration test suite (26 passing tests)
├── .env.example                 # Template for required environment variables
├── .sequelizerc                 # CLI path routing
└── package.json
```

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+) running locally or accessible via remote URI

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Fill in your database credentials:
```ini
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=carepoint_dev
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME_TEST=carepoint_test
JWT_SECRET=your_jwt_secret_at_least_64_characters_long
JWT_EXPIRES_IN=7d
FRONTEND_ORIGIN=http://localhost:3000
BCRYPT_ROUNDS=12
```

### 3. Create Databases
In PostgreSQL:
```sql
CREATE DATABASE carepoint_dev;
CREATE DATABASE carepoint_test;
```

### 4. Run Migrations & Seeders
```bash
# Apply migrations to development database
npm run db:migrate

# Seed demo data (admin, providers, patients, services, specialties)
npm run db:seed
```

To rollback:
```bash
npm run db:migrate:undo
npm run db:seed:undo
```

### 5. Start Development Server
```bash
npm run dev
# or production mode
npm start
```
The server will boot and verify database connectivity on port `5000`.

### 6. Run Test Suite
```bash
npm test
```

---

## 5. Seeded Demo Accounts (LOCAL USE ONLY)

> [!CAUTION]
> These credentials are exclusively for local demonstration and automated testing. They must never be reused in production environments.

| Role | Email | Password | Details |
|---|---|---|---|
| `ADMIN` | `admin@carepoint.demo` | `Admin1234!` | System Admin |
| `PROVIDER` | `dr.johnson@carepoint.demo` | `Provider1234!` | General Practice Clinician |
| `PROVIDER` | `dr.okafor@carepoint.demo` | `Provider1234!` | Cardiology Specialist |
| `PATIENT` | `patient1@carepoint.demo` | `Patient1234!` | Alice Mensah |
| `PATIENT` | `patient2@carepoint.demo` | `Patient1234!` | Ben Adeyemi |

---

## 6. API Endpoints Contract (`/api/v1`)

### Health
- `GET /api/v1/health` — API status and runtime environment.

### Authentication & Account
- `POST /api/v1/auth/register` — Create patient account (`email`, `password`, `firstName`, `lastName`).
- `POST /api/v1/auth/login` — Login (`email`, `password`) returns JWT token and user info.
- `GET /api/v1/auth/me` — Authenticated caller's profile.
- `POST /api/v1/auth/logout` — Informs client to discard session token.

### Patient Profile
- `GET /api/v1/patients/me` — Patient profile with contact & emergency information.
- `PATCH /api/v1/patients/me` — Update allowed fields (`phone`, `dateOfBirth`, `address`, `emergencyContactName`, `emergencyContactPhone`, `emergencyContactRelationship`). Mass-assignment protected.

### Providers & Services (Public Discovery)
- `GET /api/v1/providers?page=1&limit=10&search=&specialty=` — List active providers with specialties and services.
- `GET /api/v1/providers/:id` — Provider detail view.
- `GET /api/v1/services?page=1&limit=10&search=` — List available clinical services with duration and prices.
- `GET /api/v1/services/:id` — Service detail view.

### Appointments
- `POST /api/v1/appointments` — Request an appointment (`providerId`, `serviceId`, `startTime`, `reason`). Validates future time and prevents conflicts via `SERIALIZABLE` database transactions.
- `GET /api/v1/appointments?page=1&limit=20&status=` — Scoped appointment list (patients see theirs, providers see theirs).
- `GET /api/v1/appointments/:id` — Scoped appointment detail view.
- `PATCH /api/v1/appointments/:id/cancel` — Cancel appointment (`cancellationReason`). Enforces status checks and 60-minute cutoff for confirmed slots.
- `PATCH /api/v1/appointments/:id/status` — Provider/Admin lifecycle update (`status`: `CONFIRMED`, `COMPLETED`, `REJECTED`, `CANCELLED`).

### Administration (`ADMIN` role required)
- `GET /api/v1/admin/users?role=&status=&search=&page=1&limit=20` — Search/filter users.
- `GET /api/v1/admin/users/:id` — View user details.
- `PATCH /api/v1/admin/users/:id/status` — Activate/Suspend user account (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
- `GET /api/v1/admin/providers` — Manage all providers.
- `PATCH /api/v1/admin/providers/:id/status` — Toggle provider active status (`isActive`).
- `GET /api/v1/admin/services` — Manage clinical services.
- `POST /api/v1/admin/services` — Create a clinical service.
- `PATCH /api/v1/admin/services/:id` — Update clinical service details.
- `GET /api/v1/admin/appointments` — System-wide appointment overview.

---

## 7. Appointment Lifecycle

```
    [REQUESTED] ── (Provider/Admin confirms) ──> [CONFIRMED] ── (Provider/Admin completes) ──> [COMPLETED]
         │                                            │
         ├── (Provider/Admin rejects) ──> [REJECTED]  │
         │                                            │
         └── (Patient/Provider/Admin cancels) ────────┴──> [CANCELLED]
```
- Timezone Policy: All appointment times (`startTime`, `endTime`, `cancelledAt`, `completedAt`) are strictly handled and stored in **UTC**. Clients must send ISO 8601 strings (e.g. `2026-10-15T09:00:00.000Z`).
- Double-Booking Prevention: Atomic `SERIALIZABLE` transaction with row-level locks guarantees no overlapping active appointments for a provider.

---

## 8. Frontend Integration (Next.js)

Configure the frontend application (`.env.local`):
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Set the backend `.env`:
```ini
FRONTEND_ORIGIN=http://localhost:3000
```
This enables secure CORS authentication with credentials.

---

## 9. Security, Privacy & Compliance Notice

- Passwords hashed with bcrypt (work factor 12).
- Protected endpoints enforce JWT authentication and check real-time account status against the database.
- Mass-assignment vulnerability mitigation: only allowed fields are extracted from request bodies.
- Sanitized database queries via Sequelize parameterization.
- **Healthcare Compliance Notice**: This software is built for demonstration purposes. It is **not** HIPAA/GDPR/NDPR certified out of the box and requires medical legal review, encrypted audit logging, and HIPAA-compliant hosting before handling real patient records.
