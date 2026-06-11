# Ralph Progress Log

Each iteration appends what was done, decisions made, and files changed.
Keep entries concise. This file helps future iterations skip exploration.

## 2026-06-12 - registration-schema-validation-contract

- Completed the registration schema and validation contract task.
- Updated `src/drizzle/schema.ts` so `registrations.email` and `registrations.phonenumber` are no longer globally unique and added composite unique indexes `registrations_event_email_unique` and `registrations_event_phonenumber_unique`.
- Made `registrations.label` non-null to match the API contract and kept `created_at` without adding `updated_at`.
- Added `src/app/api/schemas/registrations.ts` with Dutch validation messages for public JSON registration creation.
- Updated `src/service/_handleDbErrors.ts` to translate same-event duplicate registration email/phone unique violations into 409 `ServiceError`s with the PRD messages.
- Added focused contract, DB error, schema metadata, logging, and service error tests so the repository coverage gate passes.
- Refactored logging/db infrastructure slightly for testability: exported `drizzleLogger` as an object and extracted `createLoggerTransports`.
- No Drizzle migrations were generated. Developer must run `bun db:generate` after reviewing schema changes.
- Verification: `bun run build` passed; `bun lint` passed with existing config export warnings; `bun test` passed with `bun dev:test` running.
