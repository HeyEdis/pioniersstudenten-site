# Plan: Registration API

> Source PRD: `docs/features/registration-api/prd.md`

## Sources

1. User interview in this conversation: original feature request and locked API/business-rule decisions.
2. Git repository: `https://github.com/HeyEdis/pioniersstudenten-site.git` - implementation repository for the Next.js/Bun/Drizzle app.
3. Existing registration schema - showed the current registrations table and global email/phone uniqueness that must change.
4. Existing event API and service patterns - informed route shape, service-layer responsibilities, admin authorization, and error handling style.
5. Existing member API and route tests - informed validation conventions, Dutch error messages, and route/integration testing approach.
6. Existing service error and database error handling modules - informed status-code mapping and database constraint translation approach.

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: Add public `POST /api/registraties`, admin-only `GET /api/evenementen/[id]/registraties`, and admin-only `DELETE /api/registraties/[id]`. Do not add registration detail, update, unregister, or dashboard-count routes in this PRD.
- **Request contract**: Registration creation accepts JSON only. The body includes `event_id`, `firstname`, `lastname`, `email`, `phonenumber`, and `label`.
- **Schema**: Keep the existing `registrations` table shape with `created_at` and no `updated_at`. Replace global email and phone uniqueness with event-scoped unique constraints for event/email and event/phone number. Do not generate the Drizzle migration as part of this plan.
- **Key models**: Use the existing event and registration domain models. Registration labels remain limited to `Aspirante pioniersstudent` and `Pioniersstudent`.
- **Validation**: Validate public inputs with Zod. Trim first and last names, require non-empty values, require a valid email, keep phone validation simple with a maximum length of 14 characters, and require a positive numeric event ID.
- **Business rules**: Public visitors can create registrations without an account. Logged-in admins are rejected by the public create endpoint. Registrations require an existing future event. Duplicate registration is scoped to the same event plus email or the same event plus phone number.
- **Authorization**: Listing and deletion require an authenticated admin session. Missing or non-admin access uses the existing service error and Dutch API error response conventions.
- **Service boundary**: Registration business logic lives behind service functions for creation, event registration listing, and deletion. Routes stay thin and translate `ServiceError`, `ZodError`, and unknown errors using the existing API pattern.
- **Error handling**: User-facing validation and domain errors stay Dutch. Duplicate event/email and event/phone database errors become precise `409 Conflict` responses.
- **Testing**: Route tests exercise HTTP behavior against the running app server. Service tests cover business rules directly. Tests verify status codes, response bodies, database side effects, and authorization outcomes.

---

## Phase 1: Public Registration Creation

**User stories**: 1, 2, 6, 7, 8, 9, 15, 16, 25, 26, 29

### What to build

Create the first end-to-end public registration path. A visitor can submit a JSON registration for an existing future event and receive the created registration back. The route validates request shape, delegates business rules to the service layer, rejects missing or past events, and preserves the existing Dutch error response style.

### Acceptance criteria

- [ ] `POST /api/registraties` accepts JSON with `event_id`, `firstname`, `lastname`, `email`, `phonenumber`, and `label`.
- [ ] Required fields, empty trimmed names, invalid email format, invalid label values, overlong phone numbers, and invalid event IDs return `400` with Dutch validation messages.
- [ ] A registration for an existing future event is persisted and returned in the response.
- [ ] A missing event returns `404` with a Dutch not-found message.
- [ ] A past-event registration attempt returns `400 Bad Request`.
- [ ] Public visitors do not need an account to register.
- [ ] A logged-in admin calling the public registration endpoint receives `403 Forbidden` with `Admins kunnen zich niet inschrijven via dit formulier.`
- [ ] Route tests cover successful creation, validation failures, missing event, past event, and admin rejection.
- [ ] Service tests cover event existence checks, past-event rejection, and successful persistence.

---

## Phase 2: Event-Scoped Duplicate Rules

**User stories**: 11, 12, 13, 14, 27, 28, 30

### What to build

Make duplicate registration protection match the product rules. The database enforces uniqueness for the same event plus email and the same event plus phone number, while allowing the same person to register for different events over time. Duplicate database errors are translated into precise Dutch conflict responses.

### Acceptance criteria

- [ ] The registration schema no longer models email and phone number as globally unique.
- [ ] The registration schema defines unique constraints for event/email and event/phone number.
- [ ] The plan implementation does not generate or hand-edit a Drizzle migration.
- [ ] Duplicate email for the same event returns `409 Conflict` with `Dit e-mailadres is al ingeschreven voor dit evenement.`
- [ ] Duplicate phone number for the same event returns `409 Conflict` with `Dit telefoonnummer is al ingeschreven voor dit evenement.`
- [ ] The same email address can register for different events.
- [ ] The same phone number can register for different events.
- [ ] Route tests cover same-event duplicate email, same-event duplicate phone number, and cross-event reuse.
- [ ] Service tests cover duplicate constraint translation for both unique constraints.

---

## Phase 3: Admin Event Registration Listing

**User stories**: 19, 20, 21, 22, 25, 26

### What to build

Add the admin-only event registration list path. An admin can request one event's registrations and receive event context together with the registrations array, allowing a future admin UI to display the event title, date, and count from `registrations.length`.

### Acceptance criteria

- [ ] `GET /api/evenementen/[id]/registraties` requires an authenticated admin session.
- [ ] Unauthenticated and non-admin requests are rejected using the existing authorization error pattern.
- [ ] A valid admin request returns basic event information, including title and date.
- [ ] A valid admin request returns the registrations array for only the requested event.
- [ ] A missing event returns a Dutch not-found response.
- [ ] The response does not include a stored registration count column.
- [ ] Route tests cover admin success, unauthenticated rejection, non-admin rejection, and missing event behavior.
- [ ] Service tests cover admin authorization, event lookup, and event-scoped registration retrieval.

---

## Phase 4: Admin Registration Deletion

**User stories**: 23, 24, 25, 26

### What to build

Add the admin-only registration deletion path. An admin can permanently delete a registration by registration ID, while public visitors and non-admin users cannot remove registrations.

### Acceptance criteria

- [ ] `DELETE /api/registraties/[id]` requires an authenticated admin session.
- [ ] Unauthenticated and non-admin requests are rejected using the existing authorization error pattern.
- [ ] A valid admin delete request permanently removes the registration row.
- [ ] Deleting a missing registration returns a Dutch not-found response.
- [ ] Invalid registration IDs return `400`.
- [ ] The API does not add visitor self-service unregister behavior.
- [ ] Route tests cover admin success, unauthenticated rejection, non-admin rejection, invalid ID, and missing registration behavior.
- [ ] Service tests cover admin authorization, not-found handling, and database deletion behavior.

---

## Phase 5: End-to-End Regression Coverage

**User stories**: 1-30

### What to build

Round out the test suite so the API contract is protected across route and service layers. This phase closes gaps left by the earlier vertical slices, verifies database side effects, and confirms that out-of-scope behavior remains absent.

### Acceptance criteria

- [ ] Route tests verify response status codes, response bodies, and database side effects for the complete registration API.
- [ ] Service tests cover `createRegistration`, `getRegistrationsForEvent`, and `deleteRegistrationById` directly.
- [ ] Tests prove duplicate protection is enforced by database constraints rather than only pre-insert service checks.
- [ ] Tests confirm registration creation accepts JSON and does not require file-upload parsing.
- [ ] Tests confirm no registration update, detail, visitor unregister, email notification, or dashboard-count behavior is introduced.
- [ ] The feature can be verified with the repo's Bun-based test commands and the required running test app setup.
