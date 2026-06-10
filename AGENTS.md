# Agent Instructions

This file captures the working conventions for agents contributing to this
repository. Prefer these conventions over generic framework defaults when they
conflict.

## Project Shape

- This is a Bun + Next.js app-router project using TypeScript.
- Use Bun for package, dev, build, and test commands. Do not introduce npm,
  pnpm, or yarn lockfiles.
- Server-side persistence uses PostgreSQL through Drizzle ORM.
- Authentication uses Better Auth with Drizzle-backed tables.
- Runtime configuration uses the `config` package plus environment variables.
- Styling is Tailwind CSS v4 via `src/app/styles/globals.css`.

## Useful Commands

- Install dependencies: `bun install`
- Start development server: `bun dev`
- Start app against test environment: `bun dev:test`
- Build: `bun run build`
- Lint: `bun lint`
- Fix lint issues: `bun lint:fix`
- Generate migrations after schema changes: `bun db:generate`
- Apply migrations: `bun db:migrate`
- Seed database: `bun db:seed`
- Prepare test database: `bun test:setup`
- Run tests: `bun test`

Tests expect the test database to exist and a separate `bun dev:test` process to
be serving the app. Do not assume `bun test` alone is enough for route tests.

## Directory Conventions

- `src/app/` contains Next app-router pages and route handlers.
- `src/app/api/` contains HTTP route handlers. Keep these thin.
- `src/service/` contains business logic and database operations.
- `src/core/` contains cross-cutting infrastructure such as auth, db, env,
  logging, and shared error types.
- `src/drizzle/schema.ts` is the source of truth for database tables and
  relations.
- `src/drizzle/zod.ts` contains Drizzle-derived Zod schemas and exported
  TypeScript types.
- `src/drizzle/migrations/` contains generated migrations. Do not hand-edit
  generated migration snapshots unless there is a very specific reason.
- `src/lib/` is for client-side shared helpers, currently only the auth client.
- `__tests__/routes/` contains Bun route/integration tests.
- `__tests__/helpers/` contains test setup and auth helpers.
- `docs/features/<feature-name>/` is used for feature PRDs and plans.
- `docs/handoff/` is used for handoff documents.

## Import Style

- Prefer TypeScript path aliases from `tsconfig.json`:
  - `@/app/*`
  - `@/core/*`
  - `@/drizzle/*`
  - `@/service/*`
  - `@/lib/*`
- Use relative imports only for nearby private helpers in the same module area.
- Keep imports explicit. Do not add barrel files unless the local codebase
  already moves in that direction.

## API Route Pattern

Route handlers should stay small:

- Parse request input in the route handler.
- Use `FormData` for endpoints that accept images or other file uploads.
- Use JSON request bodies for endpoints that only accept plain structured data.
- Validate input with Zod schemas from `src/drizzle/zod.ts` or API-specific
  schemas under `src/app/api/schemas/`.
- Call a service function for business logic and database work.
- Translate known errors into HTTP responses in the route handler.

Use this error response pattern:

- `ServiceError` becomes `{ message: error.message }` with `error.status`.
- `ZodError` becomes `{ message: error.issues.map(i => i.message) }` with
  status `400`.
- Unknown errors become `{ message: "Er is een onverwachte fout opgetreden." }`
  with status `500`.

Existing APIs use Dutch user-facing messages. Keep new user-facing validation
and error messages in Dutch unless the surrounding feature is explicitly
English.

Code, identifiers, and code comments should be written in English. User-facing
copy, validation messages, and error messages should be written in Dutch.

## Service Layer Pattern

Services in `src/service/` own business rules and Drizzle queries.

- Export named async functions for use by route handlers.
- Use `ServiceError` for expected domain and authorization failures.
- Use `ServiceError.unauthorized()` for missing/invalid authentication (`401`)
  and `ServiceError.forbidden()` for authenticated users without permission
  (`403`).
- Use `handleDBError` for known PostgreSQL constraint failures where applicable.
- Use `getLogger()` for server-side logging.
- Keep authorization checks close to the mutation they protect.
- Include useful audit context when logging forbidden mutation attempts.
- Return typed domain objects from `src/drizzle/zod.ts` where practical.

Do not put Drizzle queries directly in page components. Prefer service functions
for database access.

## Database And Validation

- Define tables, enums, relations, and the exported `schema` object in
  `src/drizzle/schema.ts`.
- Add or update matching select, insert, update, enum schemas, and exported
  inferred types in `src/drizzle/zod.ts`.
- Prefer Drizzle enum values such as `userRole.enumValues[0]` when that matches
  an existing local pattern.
- Add `created_at` and `updated_at` timestamps to domain tables unless there is
  a clear reason not to.
- After changing schema, do not generate Drizzle migrations by default. Ask the
  user to make the migration for now. This rule can change later once enough
  mutual trust has been built for agents to generate migrations directly.

## Auth

- Server auth lives in `src/core/auth.ts`.
- Client auth lives in `src/lib/auth-client.ts`.
- Admin-only mutations currently check the Better Auth session and require the
  admin role.
- Tests may create sessions through `__tests__/helpers/auth.ts` and authenticated
  fetch clients through `__tests__/helpers/setup.ts`.

## Logging

- Use `getLogger()` for server-side logs.
- Do not use Winston on the client. Client-side code may use `console.log()`
  sparingly during development, but remove noisy debug logs before finishing.
- Database query logging is already wired through the Drizzle logger.
- Logs are written under `logs/`, which is ignored by git.

## Testing Expectations

- For API behavior, add or update tests under `__tests__/routes/`.
- Prefer route-level tests that exercise the running Next server with `fetch`.
- Use helpers in `__tests__/helpers/` for auth/session setup.
- Cover success paths, validation failures, auth failures, and not-found cases
  for API changes.
- The Bun test config lives in `bunfig.toml` and collects coverage under
  `__tests__/coverage/`.

## Frontend Current State

The frontend is still mostly starter-level. The intended direction is to set up
shadcn with Base UI components, then use those as the source for needed
components.

When adding frontend work:

- Use Next app-router pages under `src/app/`.
- Once shadcn/Base UI is configured, use those components for reusable UI needs.
- Use Tailwind classes for styling and layout.
- Before shadcn/Base UI is configured, keep page components simple and avoid
  introducing a different UI library.
- Replace starter content and metadata when working on user-facing pages.

## Environment And Local Services

- Local Postgres services are defined in `docker-compose.yml`.
- Development database listens on port `5432`.
- Test database listens on port `5434`.
- `.env` and `.env.test` are required locally but ignored by git.
- `APP_ENV` controls environment-specific config. Expected values include
  `development`, `test`, and `production`.

## CI And Deployment

- GitHub Actions builds a Docker image on pushes to `main`.
- The Dockerfile builds with Bun and Next standalone output.
- Be careful with changes to `Dockerfile`, `next.config.ts`, or build scripts;
  they can affect deployment directly.

## Documentation Conventions

- Use `docs/features/<feature-name>/prd.md` for PRDs.
- Use `docs/features/<feature-name>/plan.md` or `plan.json` for implementation
  plans, depending on the planning workflow.
- Save agent handoffs under `docs/handoff/`.
- Reference existing docs, plans, issues, and commits instead of duplicating
  long content.

## Known Project Quirks

- Some current files still contain starter Next content.
- Some comments and README text contain typos or encoding artifacts. Do not
  treat those as conventions to copy.
- Route tests require a running app server, so failures may be environment setup
  issues rather than code regressions.
