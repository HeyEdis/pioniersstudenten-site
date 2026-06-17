# Agent Instructions

This file explains how to work in this repository. For implementation taste,
code structure, validation placement, test shape, and examples, read
[`STYLE.md`](./STYLE.md) before writing code.

When the two files overlap, use this split:

- `AGENTS.md` owns repository operation: commands, environment, directories,
  tooling, and documentation locations.
- `STYLE.md` owns implementation conventions: how code should be shaped.

## Project Shape

- This is a Bun + Next.js app-router project using TypeScript.
- Use Bun for package, dev, build, and test commands. Do not introduce npm,
  pnpm, or yarn lockfiles.
- Server-side persistence uses PostgreSQL through Drizzle ORM.
- Authentication uses Better Auth with Drizzle-backed tables.
- Runtime configuration uses the `config` package plus environment variables.
- Styling is Tailwind CSS v4 via `src/app/styles/globals.css`.

## Commands

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

Route tests expect the test database to exist and a separate `bun dev:test`
process to be serving the app. Do not assume `bun test` alone is enough for
route tests.

## Directory Map

- `src/app/` contains Next app-router pages and route handlers.
- `src/app/api/` contains HTTP route handlers.
- `src/app/api/schemas/` contains route-local Zod schemas.
- `src/service/` contains business logic and database operations.
- `src/core/` contains cross-cutting infrastructure such as auth, db, env,
  logging, and shared error types.
- `src/drizzle/schema.ts` is the source of truth for database tables and
  relations.
- `src/drizzle/zod.ts` contains Drizzle-derived Zod schemas and exported
  TypeScript types.
- `src/drizzle/migrations/` contains generated migrations. Do not hand-edit
  generated migration snapshots unless there is a very specific reason.
- `src/lib/` is for client-side shared helpers.
- `src/components/ui/` contains reusable shadcn UI components.
- `__tests__/routes/` contains Bun route/integration tests.
- `__tests__/helpers/` contains test setup and auth helpers.
- `__tests__/fixtures/` contains reusable test data.
- `docs/features/<feature-name>/` is used for feature PRDs and plans.
- `docs/handoff/` is used for handoff documents.

## Import Style

- Prefer TypeScript path aliases from `tsconfig.json`:
  - `@/app/*`
  - `@/core/*`
  - `@/drizzle/*`
  - `@/service/*`
  - `@/lib/*`
  - `@/components/*`
  - `@/components/ui/*`
  - `@/hooks/*`
- Use relative imports only for nearby private helpers in the same module area.
- Keep imports explicit. Do not add barrel files unless the local codebase
  already moves in that direction.

## Environment

- Local Postgres services are defined in `docker-compose.yml`.
- Development database listens on port `5432`.
- Test database listens on port `5434`.
- `.env` and `.env.test` are required locally but ignored by git.
- `APP_ENV` controls environment-specific config. Expected values include
  `development`, `test`, and `production`.

## Frontend Tooling

- The frontend uses shadcn with Base UI components.
- Reusable UI components live under `src/components/ui/`.
- Shared UI utilities live in `src/lib/utils.ts`.
- Use Tailwind classes for styling and layout.
- Do not introduce a different UI library.

## CI And Deployment

- GitHub Actions builds a Docker image on pushes to `main`.
- The Dockerfile builds with Bun and Next standalone output.
- Be careful with changes to `Dockerfile`, `next.config.ts`, or build scripts;
  they can affect deployment directly.

## Documentation

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
