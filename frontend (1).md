# Frontend Build Prompt --- Care Platform

## Mission and working rules

You are the autonomous frontend engineer for a polished, functional
medical-services platform. Build it from the **currently empty project
folder**. Do not assume an existing app, package.json, components, or
configuration. Inspect the folder first, initialize the project, install
dependencies, and prepare the complete development environment before
implementing features.

Work with strong ownership. Do not ask me to approve each routine
decision or ask questions after every step. Make sensible, conventional
engineering decisions and continue. **Stop and ask one concise, specific
question only when a genuine blocker requires information or access I
must provide**---for example, a missing secret, an unavailable external
service account, or an important product decision that cannot be safely
inferred. Never invent credentials. For everything else, choose a
reasonable default, document it, and proceed.

Do not merely describe what you would do. Implement the application, run
it, inspect the result where tools permit, test it, debug errors, and
continue until the requirements are met. Keep a short running checklist
in the project documentation and report verified results separately from
anything not verified.

The product is a simple, welcoming medical platform for everyday
healthcare tasks---not a hospital ERP, not a diagnostic AI, and not an
overcomplicated social network. Take interaction and visual-quality
inspiration from **Uber Eats and Chowdeck**: clear hierarchy, confident
cards, friendly iconography, simple navigation, useful status
indicators, strong search/action patterns, and a smooth mobile-first
experience. Do not copy their branding or exact layouts. The result
should feel specifically designed for healthcare: calm, trustworthy,
inclusive, accessible, and easy to understand for people with varying
levels of technical confidence.

## Required stack

-   Next.js using the App Router and **JavaScript/JSX only**. Do not use
    TypeScript, `.ts`, `.tsx`, or introduce TypeScript configuration.
-   Tailwind CSS **v4**. Use the v4 approach (`@import "tailwindcss";`,
    CSS-first configuration such as `@theme` when needed). Do not
    install Tailwind v3 or create a v3-style `tailwind.config.js` unless
    a genuine compatibility requirement is proven.
-   shadcn/ui components where they help. Initialize/configure shadcn/ui
    for the installed Next.js and Tailwind v4 versions, then use
    accessible primitives rather than rebuilding common controls from
    scratch. Use the current compatible setup and verify it actually
    works.
-   Motion (`motion` / Motion for React, or the current compatible
    package) for purposeful transitions and interactions. Do not add
    animation to everything.
-   `lucide-react` for consistent, friendly icons. Avoid emoji as
    interface icons.
-   Use current stable, mutually compatible package versions. Do not
    blindly copy outdated setup commands from tutorials.
-   Use the REST API supplied by the separate backend prompt. The
    frontend must not pretend that local mock data is the real
    application.

## First actions: prepare the empty folder

1.  Inspect the current directory and available runtime/tooling.
2.  Initialize a Next.js App Router project in this folder (not an
    unnecessary nested project directory).
3.  Choose JavaScript, ESLint if compatible, and the `src/` directory if
    the current setup supports it cleanly.
4.  Install and configure Tailwind CSS v4, shadcn/ui, Motion,
    lucide-react, and only other justified dependencies.
5.  Set up a clear, conventional project structure and environment
    variable example.
6.  Start the development server and resolve installation/configuration
    errors before building the full UI.
7.  Do not overwrite or delete existing user files if the folder turns
    out not to be empty. Inspect and preserve anything already present.

## Product definition

Use a neutral, memorable working name such as **CarePoint** (make the
brand name easy to change in one place). The platform connects patients
to practical healthcare services. Its basic scope:

-   Account registration and login.
-   Patient dashboard and profile.
-   Browse/search healthcare providers and services.
-   View provider details, opening hours, specialties, and service
    information where available.
-   Request/book an appointment, view appointment status, and cancel
    when allowed.
-   View a patient-friendly list of appointments and appointment
    history.
-   View basic prescriptions/medication instructions and records only
    when returned by the backend.
-   View and manage a simple health profile (contact details, date of
    birth, emergency contact, relevant notes only if supported by
    backend).
-   A clear help/contact area and empty/error/loading states.
-   Admin workflows for managing users, providers, services, and
    appointments if the backend implements them.
-   Provider/clinician workflows only if the backend implements that
    role; do not invent unsupported permissions or endpoints.

Keep the initial product appropriately small. Do not add video
consultations, insurance claims, real prescriptions, payment processing,
pharmacy fulfillment, lab integrations, medical diagnosis, or other
major systems unless the backend contract explicitly supports them.
Never claim a real booking, payment, diagnosis, or prescription occurred
unless the API confirms it.

## Visual direction

### Brand and color

Create a tasteful healthcare palette with a distinctive primary color.
Preferred direction:

-   Deep teal/green as the primary action color.
-   Warm off-white or very pale neutral backgrounds.
-   Dark ink/slate text for readability.
-   Soft mint/teal surfaces for selected states and gentle highlights.
-   A restrained secondary accent such as sky blue or muted coral for
    informational emphasis.
-   Use semantic success, warning, error, and neutral colors
    consistently.

Avoid gold. Avoid neon colors, heavy gradients, excessive glassmorphism,
generic purple AI aesthetics, and over-saturated rainbow dashboards.
Maintain WCAG-conscious contrast. Use design tokens/CSS variables so the
palette can be changed centrally. Use color for meaning, not decoration.

### Layout and UI

-   Minimal, crisp, friendly, professional and contemporary.
-   Strong typographic hierarchy, generous but efficient spacing,
    rounded corners used consistently, subtle borders and shadows, and
    restrained surface layering.
-   A polished landing/auth experience and a real application shell
    after login.
-   Desktop: clean sidebar or top-level navigation plus a useful main
    content area. Mobile: compact header and appropriate bottom
    navigation or collapsible menu.
-   Prioritize the next useful action rather than filling every screen
    with charts.
-   Dashboard should feel alive and useful, with a welcome header, next
    appointment/status, quick actions, service/provider discovery, and
    recent activity when data exists.
-   Use shadcn/ui for buttons, inputs, forms, dialogs, sheets,
    dropdowns, tabs, badges, tables, skeletons, toast/sonner
    notifications, and other suitable primitives. Customize them to the
    brand; do not leave the app looking like an untouched
    component-library demo.
-   Use Lucide icons consistently with labels where necessary. Icons
    must be friendly and understandable, not decorative noise.
-   Use imagery only where it genuinely improves the experience. Prefer
    a coherent, subtle visual language over random stock photos.
-   Add polished empty states with clear next actions, useful loading
    skeletons, meaningful error messages, confirmation dialogs for
    destructive actions, and success feedback.
-   Use responsive design at small, medium, and large breakpoints. Check
    that tables, forms, dialogs, navigation, and cards remain usable on
    mobile.
-   Respect reduced-motion preferences. Animation must never block
    access or make content hard to read.

### Motion

Use Motion for purposeful micro-interactions: - Gentle page/section
entrance where appropriate. - Short transitions for dialogs, menus,
tabs, cards, and state changes. - A subtle stagger for a small group of
dashboard elements if it improves clarity. - Button and card feedback
that does not shift the layout unexpectedly. - Avoid scroll-jacking,
long intro animations, heavy parallax, constant floating effects, or
animation that delays core tasks. - Keep durations restrained and
support `prefers-reduced-motion`.

## Required pages and user flows

Build pages around the actual API contract. Route names may be adjusted
to fit the final backend, but document the mapping.

### Public

-   Landing/home page explaining the platform plainly.
-   Sign up.
-   Login.
-   Helpful 404/not-found and error pages.
-   Optional service/provider discovery only if it can be accessed
    safely from the backend without authentication.

### Patient

-   Dashboard.
-   Browse/search providers or available services.
-   Provider/service detail.
-   Book/request an appointment with validated date/time and reason
    fields supported by the backend.
-   Appointments list with upcoming/past/status filters.
-   Appointment detail, status and allowed cancellation.
-   Health profile/account settings.
-   Prescriptions/records view only when API endpoints and data models
    exist.
-   Logout.

### Admin/provider roles

-   Implement role-specific areas only for roles supported by the
    backend.
-   Hide navigation actions users cannot access, but do not rely on
    frontend hiding as security; the API remains authoritative.
-   Admin should have appropriate management views, filters, details,
    and confirmation for risky actions.
-   If the backend has no clinician/provider role, do not manufacture
    one. Explain the actual supported roles in the README.

### Functional acceptance requirements

-   Registration and login communicate with the API and handle errors.
-   Protected pages require a valid authenticated session.
-   User role determines the correct dashboard and available navigation.
-   Search, filters, pagination, sorting, booking, cancellation, and
    profile edits work where supported by the API.
-   Forms have labels, validation, pending/disabled states, and readable
    server-error messages.
-   Refreshing a protected page behaves correctly; logout clears the
    session and returns to a public route.
-   No dead buttons, fake controls, links to `#`, or success toasts
    shown before an API request succeeds.
-   No core workflow depends on hardcoded demo data or localStorage
    pretending to be a database.
-   If demo/sample data is needed for visual development, isolate it
    clearly and do not use it as a silent fallback when the API fails.
-   Every implemented control must have a real action or be visibly
    disabled with a reason.

## API integration and authentication

1.  Before writing API calls, inspect the backend implementation and/or
    its README/OpenAPI documentation. Establish the actual endpoint
    paths, payload shapes, response shapes, pagination, status enums,
    and auth mechanism.
2.  Create a central API client, e.g. `src/lib/api.js`, that reads
    `NEXT_PUBLIC_API_URL` from environment variables and consistently
    handles JSON, credentials/token, non-2xx responses, network
    failures, and expired sessions.
3.  Add `.env.example` with a documented API URL. Never commit secrets.
4.  Keep API calls out of UI components where practical; use small
    service/helper functions and reusable hooks or server/client
    patterns appropriate to Next.js.
5.  Use the backend as the source of truth. Do not create a separate
    fake frontend data store.
6.  Match the backend's authentication strategy. Prefer secure,
    HTTP-only cookies if the backend supports them. If the provided API
    only supports bearer JWT, document the security trade-offs and
    implement the most appropriate workable approach without exposing
    secrets. Never put secrets in `NEXT_PUBLIC_*`.
7.  Do not silently assume a response property exists. Inspect and
    normalize actual API responses.
8.  Display clear loading, empty, success, validation, permission,
    offline, and server-error states.
9.  Avoid logging passwords, tokens, medical details, or other sensitive
    personal information to the console.
10. Keep API URL, brand name, and reusable design tokens centralized.

## Healthcare privacy, safety, and accessibility

-   Treat personal and medical information as sensitive. Show only data
    the authenticated user is authorized to access.
-   Do not store sensitive medical information in analytics, browser
    logs, URLs, or unnecessary client persistence.
-   Do not make diagnostic claims, recommend treatment, or imply that
    the platform replaces a qualified professional.
-   Do not invent clinician credentials, ratings, opening hours,
    availability, appointments, or medical records.
-   Make it clear that emergency situations require local emergency
    services; the platform is not an emergency service.
-   Use semantic HTML, keyboard-accessible controls, visible focus
    states, appropriate labels, accessible dialogs, readable error
    summaries, and sufficient contrast.
-   Include accessible form validation and do not communicate state by
    color alone.
-   Use realistic but clearly labelled seeded/demo content only where it
    comes from the backend's demo seed or is explicitly marked as
    demonstration data.

## Code conventions --- follow consistently

-   Use JavaScript and JSX only.
-   Use CommonJS only in Node backend files where appropriate; frontend
    Next.js files should follow Next.js's supported module conventions.
-   Use camelCase for variables and functions.
-   Use semicolons and double quotes.
-   Choose descriptive names over cryptic abbreviations.
-   Keep components small and understandable; avoid giant page
    components.
-   Prefer straightforward, conventional folder organization and
    reusable components where repetition genuinely exists.
-   Add comments only when the reasoning or non-obvious logic needs
    explanation. Do not comment every line or narrate obvious JSX.
-   Avoid over-engineering, needless abstractions, premature generic
    frameworks, duplicate libraries, and excessive dependencies.
-   Follow the established formatting and naming patterns throughout the
    project.
-   Do not add TypeScript just because a library example uses it;
    translate examples to JavaScript.
-   Do not hide lint/build errors with broad disables or weaken checks
    just to get a green result.

## Suggested structure

Adapt to the actual project, but keep a clear separation between routes,
reusable components, feature-specific UI, API access, and shared
utilities. For example:

-   `src/app/` --- App Router pages and layouts.
-   `src/components/ui/` --- shadcn/ui components.
-   `src/components/layout/` --- application shell, navigation, headers.
-   `src/components/shared/` --- shared status badges, loading,
    empty/error states.
-   `src/features/auth/`
-   `src/features/appointments/`
-   `src/features/providers/`
-   `src/features/profile/`
-   `src/lib/api.js`
-   `src/lib/auth.js`
-   `src/lib/utils.js`
-   `public/`
-   `.env.example`
-   `README.md`

Do not create empty abstractions for every possible feature. Use this as
a guide, not a requirement to generate boilerplate without purpose.

## Debugging, testing, and completion process

Work through the following loop continuously: implement a small coherent
feature → run relevant checks → inspect errors → fix root causes → rerun
checks. Do not leave known errors for me to discover.

1.  Verify dependency installation and Tailwind v4/shadcn configuration.
2.  Run ESLint and the production build, fixing errors rather than
    suppressing them.
3.  Add practical tests for important utilities and user flows if the
    project setup supports them without disproportionate overhead.
4.  Test API integration against the running backend where possible. If
    the backend is not running, report that as a real integration
    blocker; do not pretend API workflows passed.
5.  Test sign-up/login, protected navigation, patient dashboard,
    appointment creation, status display, cancellation rules, profile
    updates, role-based screens, and logout where supported.
6.  Inspect browser console and server terminal output. Fix React
    warnings, hydration errors, failed imports, incorrect links, broken
    images, and runtime errors.
7.  Check responsive behavior at mobile and desktop sizes if browser
    tooling is available.
8.  Use Postman/Thunder Client only if available; do not claim you used
    them if you did not.
9.  Verify that no required workflow is represented by an inert UI.
10. Re-run lint, tests, and production build after the final fixes.

## Documentation and final report

Create a useful `README.md` explaining: - What the frontend does and
which roles are supported. - Exact install and run commands. - Required
environment variables and where `.env.local` belongs. - How to connect
to the backend and configure `NEXT_PUBLIC_API_URL`. - How to run lint,
tests, and production build. - Implemented routes and API endpoint
mapping. - Any limitations, assumptions, or unverified integrations.

Maintain a checklist such as `docs/implementation-checklist.md` if
useful. Mark an item complete only after checking it.

At the end, report: 1. What you built. 2. Files and key architecture
choices. 3. Exact commands to run it. 4. Environment variables I must
supply. 5. Tests/build checks actually run and their real results. 6.
Any remaining blockers, limitations, or work that needs my input.

Do not stop after scaffolding. Deliver the most complete, stable,
polished implementation possible within the available environment.
