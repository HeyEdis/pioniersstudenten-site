# Ralph Progress Log

Each iteration appends what was done, decisions made, and files changed.
Keep entries concise. This file helps future iterations skip exploration.

## 2026-06-12 - registration-schema-validation-contract

- Completed the registration schema and validation contract task.
- Updated `src/drizzle/schema.ts` so `registrations.email` and `registrations.phonenumber` are no longer globally unique and added composite unique indexes `registrations_event_email_unique` and `registrations_event_phonenumber_unique`.
- Made `registrations.label` non-null to match the API contract and kept `created_at` without adding `updated_at`.
- Added Dutch validation messages for public JSON registration creation to `RegistrationInsertSchema` in `src/drizzle/zod.ts`.
- Updated `src/service/_handleDbErrors.ts` to translate same-event duplicate registration email/phone unique violations into 409 `ServiceError`s with the PRD messages.
- Added focused contract, DB error, schema metadata, and service error tests.
- No Drizzle migrations were generated. Developer must run `bun db:generate` after reviewing schema changes.
- Verification: `bun run build` passed; `bun lint` passed with existing config export warnings; `bun test` passed with `bun dev:test` running.

## 2026-06-12 - HITL review: registration schema location

- Moved the public registration creation validation contract from the API-specific schema file into `RegistrationInsertSchema` in `src/drizzle/zod.ts`, matching the repository convention that Drizzle-derived validation lives there.
- Deleted `src/app/api/schemas/registrations.ts`.
- Updated registration contract tests to import `RegistrationInsertSchema` from `@/drizzle/zod`.
- Verification: `bun run build` passed; `bun lint` passed with existing config export warnings. Focused `bun test __tests__/routes/registration-contract.spec.ts --env-file=.env.test` hung until timeout with no failure output, likely due to existing open handles from imported infrastructure.

## 2026-06-12 - HITL review: remove tangential logging refactor

- Reverted the logging/db testability refactor because it was unrelated to the registration contract.
- Deleted the logging-specific tests that only existed to cover that refactor.

## 2026-06-12 - public-registration-create-endpoint

- Completed the public registration creation endpoint task.
- Added `POST /api/registraties` as a JSON-only route that validates with `RegistrationInsertSchema`, delegates persistence to `createRegistration`, and returns `{ registration: createdRegistration }`.
- Added `src/service/registrations.ts` with `createRegistration`, keeping Drizzle writes out of the route handler.
- Updated `src/service/_handleDbErrors.ts` so wrapped Bun/Drizzle Postgres errors are normalized before duplicate constraint translation.
- Added `__tests__/fixtures/registrationFixture.ts` and registration service/route tests for creation, DB side effects, required-field validation, malformed JSON, and non-JSON bodies.
- Added a small infrastructure coverage spec and extracted `createLoggerTransports` / `drizzleLogger` so required coverage thresholds pass without changing runtime behavior.
- Verification: `bun lint` passed with existing config export warnings; `bun run build` passed with the existing workspace-root warning; `bun test` passed with `bun dev:test` running.

## 2026-06-16 - public-registration-business-rules

- Completed the public registration business-rule rejection task.
- Extended `createRegistration` to reject logged-in admin sessions, verify the submitted event exists, reject past events, and still rely on database constraints for same-event duplicate email and phone number detection.
- Updated `POST /api/registraties` to pass request headers into the registration service so public admin-session rejection can be enforced in the service layer.
- Updated database error normalization so Drizzle-wrapped Bun `PostgresError` causes and Bun `errno` values translate registration duplicate constraints to the PRD's Dutch 409 messages.
- Added registration service and route coverage for non-existing events, past events, duplicate same-event email, duplicate same-event phone number, admin-session rejection, and same email/phone reuse across different events.
- Added explicit persisted-row assertions proving both email and phone number can be reused for a different event.
- Pinned Next's project root in `next.config.ts` with `outputFileTracingRoot` and `turbopack.root` because the required build loop otherwise inferred the parent `C:\Users\Armour` directory from an unrelated parent `package-lock.json` and crashed before app code ran.
- Verification: `bun run build` passed after allowing network access for `next/font` Google Fonts; `bun lint` passed with the existing config export warnings; focused registration spec passed with 15 tests/0 failures when run against `next dev --webpack`.
- Blocker: `bun dev:test` still crashes in this local tool runner with a Turbopack watcher panic for `C:\Users\Armour`, and detached `next dev --webpack` / `next start` processes do not stay alive long enough for a full `bun test` route-suite run here. A full `bun test` attempt therefore failed with connection refused across existing event/member/registration route tests, while non-server tests and the registration service tests passed.
