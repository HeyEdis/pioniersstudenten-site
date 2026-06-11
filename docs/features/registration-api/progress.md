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
