# Style

This file describes how implementation code in this project should be shaped.
Use it before planning, coding, reviewing, or generating Ralph tasks.

The goal is boring, readable, typed code with clear ownership boundaries. Prefer
small explicit functions, route handlers that only translate HTTP concerns, and
service functions that own business rules and database work.

If existing code conflicts with this file, follow this file. Some older code is
useful evidence, but it is not automatically the standard.

## Language And Copy

- Code, identifiers, and comments are written in English.
- User-facing copy, validation messages, and API error messages are written in
  Dutch unless a feature is explicitly English.
- Keep comments rare. Use them to explain non-obvious intent, not to narrate
  ordinary TypeScript.
- Prefer explicit names over abbreviations. A little extra length is better than
  making the next reader guess.

## Route Handlers

Route handlers in `src/app/api/` stay thin. They translate HTTP input and output;
they do not own business rules.

A route handler should usually:

1. Read JSON, `FormData`, params, or query values.
2. Validate/coerce input with the right Zod schema.
3. Call a named service function.
4. Return JSON.
5. Translate `ServiceError`, `ZodError`, and unknown errors.

Use `FormData` for endpoints that accept images or file-like uploads. Use JSON
for plain structured data.

Good:

```ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const registration = RegistrationInsertSchema.parse(body);
    const created = await createRegistration(registration, request.headers);

    return NextResponse.json({ registration: created });
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { message: error.message },
        { status: error.status },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.issues.map((issue) => issue.message) },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Er is een onverwachte fout opgetreden." },
      { status: 500 },
    );
  }
}
```

Bad:

```ts
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.email.includes("@")) {
    return NextResponse.json({ message: "Bad email" }, { status: 400 });
  }

  await db.insert(registrations).values(body);
  return NextResponse.json({ ok: true });
}
```

Why it is bad: the route owns validation text, talks directly to Drizzle, skips
the service layer, and uses English user-facing copy.

## Error Responses

Use the same route error shape everywhere:

- `ServiceError` becomes `{ message: error.message }` with `error.status`.
- `ZodError` becomes `{ message: error.issues.map((issue) => issue.message) }`
  with status `400`.
- Unknown errors become `{ message: "Er is een onverwachte fout opgetreden." }`
  with status `500`.

Do not invent one-off response formats for normal API errors.

## Service Layer

Services in `src/service/` own business rules, authorization checks, and Drizzle
queries. Route handlers should call services; page components should not contain
Drizzle queries.

Keep service-only helper functions in the same service file by default. Extract
them only when they are reused across services or when the service file becomes
hard to read.

Zod schemas validate shape, coercion, and field-level constraints. Services own
rules that need auth, database state, time, logging, or domain errors.

Service functions should:

- Export named async functions.
- Accept already-validated data where practical.
- Use `ServiceError` for expected domain and authorization failures.
- Use `ServiceError.unauthorized()` for missing/invalid authentication.
- Use `ServiceError.forbidden()` for authenticated users without permission.
- Keep authorization checks close to the query or mutation they protect.
- Use `handleDBError` for known PostgreSQL constraint failures.
- Use `getLogger()` for server-side logging.
- Return typed domain objects from `src/drizzle/zod.ts` where practical.

Good:

```ts
export const deleteById = async (eventId: number, headers: Headers): Promise<void> => {
  const session = await auth.api.getSession({ headers });

  if (session?.user.role !== userRole.enumValues[0]) {
    getLogger().warn(`Forbidden event delete attempt for event ${eventId}.`);
    throw ServiceError.forbidden("Gebruiker heeft geen toegang.");
  }

  const [eventById] = await db
    .select()
    .from(event)
    .where(eq(event.id, eventId));

  if (!eventById) {
    throw ServiceError.notFound(`Evenement met ID ${eventId} is niet gevonden.`);
  }

  try {
    await db.delete(event).where(eq(event.id, eventId));
  } catch (error) {
    getLogger().error(error);
    throw handleDBError(error);
  }
};
```

Bad:

```ts
export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  await db.delete(event).where(eq(event.id, id));
  return NextResponse.json({});
}
```

Why it is bad: the route bypasses authorization, not-found handling, logging,
and the service layer.

## Validation And Zod

Use `src/drizzle/zod.ts` for schemas that describe persisted table data:

- select schemas
- insert schemas
- update schemas
- enum schemas
- inferred domain types
- create/update request bodies that directly map to a table-backed domain row

Use `src/app/api/schemas/` for route-local schemas:

- path params
- query params
- response wrappers
- composed response shapes
- route inputs that do not directly map to a table insert/update/select

Good:

```ts
// src/drizzle/zod.ts
export const RegistrationInsertSchema = createInsertSchema(registrations, {
  email: z
    .string()
    .trim()
    .nonempty("E-mailadres is verplicht.")
    .email("E-mailadres is ongeldig."),
});
```

Good:

```ts
// src/app/api/schemas/events.ts
export const EventByIdQuerySchema = z.object({
  id: z.coerce.number(),
});
```

Bad:

```ts
// src/app/api/registraties/schema.ts
export const CreateRegistrationSchema = z.object({
  email: z.string().email(),
});
```

Why it is bad: registration creation is a table-backed insert contract, so it
belongs with the Drizzle-derived schemas in `src/drizzle/zod.ts`.

## Types

Do not litter the service layer with separate type files. Shared exported types
that are not Drizzle/Zod-inferred table types belong in `src/types/<domain>.ts`.

Use this split:

- `src/drizzle/zod.ts` owns table-backed inferred types such as `Registration`,
  `Event`, and `Member`.
- `src/types/<domain>.ts` owns shared domain, request, response, and service
  input/output types that are not direct Drizzle/Zod table contracts.
- `src/service/*.ts` owns service functions, local helper functions, and small
  private implementation details.

Do not create files like `src/service/registrationTypes.ts`,
`src/service/types.ts`, or `src/service/registrations.types.ts`.

Good:

```ts
// src/types/registration.ts
import type { Registration } from "@/drizzle/zod";

export interface RegistrationListResponse {
  registrations: Registration[];
}
```

```ts
// src/service/registrations.ts
import type { RegistrationListResponse } from "@/types/registration";
```

Bad:

```ts
// src/service/registrations.types.ts
export interface RegistrationListResponse {
  registrations: unknown[];
}
```

Why it is bad: service-adjacent type files make the service layer harder to
scan and scatter shared contracts across implementation folders.

## Database Schema

Define tables, enums, relations, and the exported `schema` object in
`src/drizzle/schema.ts`.

When a domain table changes:

- Update matching schemas and exported inferred types in `src/drizzle/zod.ts`.
- Add `created_at` and `updated_at` timestamps unless there is a clear reason
  not to.
- Prefer Drizzle enum values such as `userRole.enumValues[0]` when that matches
  existing local usage.
- Do not generate Drizzle migrations by default. Ask the user to make the
  migration for now.

Do not hand-edit generated migration snapshots.

## Auth

Server-side auth checks use `auth` from `src/core/auth.ts`. Client-side auth uses
`src/lib/auth-client.ts`.

Admin-only mutations currently check the Better Auth session and require the
admin role. Keep that check in the service function, close to the protected
database work.

## Tests

For API behavior, add or update tests under `__tests__/routes/`.

Prefer route-level tests that exercise the running Next server with `fetch`.
These tests require:

- the test database to exist
- `bun test:setup` to have prepared it
- a separate `bun dev:test` process serving the app

Cover the important behavior, not every implementation detail:

- happy path
- validation failure
- auth failure
- not-found case
- meaningful database constraint/domain failure when relevant

Good:

```ts
it("rejects registrations for an event that does not exist", async () => {
  const response = await postRegistration({
    ...marieRegistration,
    event_id: 999999,
  });

  expect(response.ok).toBe(false);
  expect(response.status).toBe(404);

  const body = await response.json();
  expect(body.message).toBe("Evenement met ID 999999 is niet gevonden.");
});
```

Bad:

```ts
it("creates stuff", async () => {
  const response = await fetch("/api/registraties", { method: "POST" });
  expect(response.status).not.toBe(500);
});
```

Why it is bad: it does not use the real test server URL, does not send a real
body, and proves almost nothing.

## Helpers And Fixtures

Use helpers for repeated test mechanics:

- creating sessions
- creating authenticated fetch clients
- cleanup routines

Use fixtures for reusable domain data:

- realistic default records
- full required object literals for table-backed inputs

Good:

```ts
export const marieRegistration = {
  event_id: 1,
  firstname: "Marie",
  lastname: "Peeters",
  email: "marie.peeters@example.com",
  phonenumber: "0470123456",
  label: "Aspirante pioniersstudent",
};

await postRegistration({
  ...marieRegistration,
  email: "ander.email@example.com",
});
```

Bad:

```ts
await postRegistration({
  event_id: 1,
  firstname: "Marie",
  lastname: "Peeters",
  email: "marie.peeters@example.com",
  phonenumber: "0470123456",
  label: "Aspirante pioniersstudent",
});
```

Why it is bad: duplicating full object literals across tests makes later schema
changes painful and hides the actual per-test difference.

## Frontend

Use Next app-router pages under `src/app/`.

When adding frontend work:

- Use shadcn components for reusable UI needs.
- Add new reusable shadcn components under `src/components/ui/`.
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes.
- Use Tailwind classes for styling and layout.
- Do not introduce a different UI library without explicit approval.
- Replace starter content and metadata when working on user-facing pages.
- Do not use Winston or server-only utilities on the client.

## Implementation Taste

- Prefer straightforward functions over clever abstractions.
- Add an abstraction only when it removes real duplication or clarifies a
  repeated concept.
- Keep files close to their ownership boundary.
- Do not use barrel files. Import from the concrete module that owns the export,
  such as `@/service/registrations`.
- Keep validation messages near the schema that owns the contract.
- Keep shared exported types out of `src/service/`; use `src/types/<domain>.ts`
  unless the type is a Drizzle/Zod-inferred table type.
- Keep business error messages in services, not routes.
- Keep database constraint translation in `handleDBError`.
- Avoid noisy debug logs. Remove client-side `console.log()` calls before
  finishing.
- Do not copy typo-ridden comments or starter content as style examples.
