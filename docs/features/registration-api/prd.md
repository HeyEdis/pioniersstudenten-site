## Problem Statement

Visitors need a low-friction way to register for an event without creating an account. The site already has events and a registrations table, but there is no agreed API contract for creating, listing, and deleting registrations.

The current registrations schema also conflicts with the expected behavior: email and phone number are globally unique, which prevents the same person from registering for multiple different events. Registrations should instead prevent duplicate registration only within the same event.

## Solution

Build a registration API that lets public visitors submit a JSON registration form for a specific event. The API validates the submitted event, rejects registrations for past events, and prevents duplicate registration for the same event by email or phone number.

Admins can list all registrations for one event and delete registrations when needed. Visitors cannot unregister themselves after submission. Confirmation email, admin email, in-app notifications, and the future admin dashboard UI are intentionally left for later PRDs.

The registration form will reuse the existing public event detail endpoint to display the selected event name/date and preselect the event label as the default registration label.

## User Stories

1. As a public visitor, I want to register for an event without creating an account, so that signing up has as little friction as possible.
2. As a public visitor, I want to choose the event I am registering for, so that my registration is linked to the correct event.
3. As a public visitor, I want to see the event title and date before registering, so that I know I am submitting the form for the right event.
4. As a public visitor, I want the registration form to preselect the event's label, so that the common choice is already filled in.
5. As a public visitor, I want to change my registration label from the two supported label values, so that the registration describes me correctly.
6. As a public visitor, I want to enter my first name, last name, email address, phone number, and label, so that the nonprofit has the information it needs.
7. As a public visitor, I want validation errors when required fields are missing, so that I can correct the form.
8. As a public visitor, I want the API to validate my email format, so that invalid email addresses are not accepted.
9. As a public visitor, I want phone number validation to stay simple, so that normal Belgian phone formats are not blocked by overly strict validation.
10. As a public visitor, I want a success message or success page after registration, so that I know my submission worked.
11. As a public visitor, I want to be blocked from registering twice for the same event with the same email address, so that duplicate registrations are avoided.
12. As a public visitor, I want to be blocked from registering twice for the same event with the same phone number, so that duplicate registrations are avoided.
13. As a public visitor, I want to use the same email address for different events, so that I can register for multiple events over time.
14. As a public visitor, I want to use the same phone number for different events, so that I can register for multiple events over time.
15. As a public visitor, I want a clear error if I try to register for an event that does not exist, so that I know the link or event is invalid.
16. As a public visitor, I want to be blocked from registering for past events, so that registrations only happen for relevant events.
17. As a public visitor, I want to cancel or close the form before submitting, so that I can decide not to register.
18. As a public visitor, I do not need an unregister feature after submission, so that the first API version stays simple.
19. As an admin, I want to list registrations for a specific event, so that I can see who registered.
20. As an admin, I want the event title and date returned with the registration list, so that the admin UI can show context for the list.
21. As an admin, I want to count registrations from the returned registrations array, so that the UI can show how many people registered without a stored count column.
22. As an admin, I want registration listing to require admin authentication, so that visitor data is protected.
23. As an admin, I want to delete a registration by registration ID, so that incorrect or manually removed registrations can be cleaned up.
24. As an admin, I want delete operations to require admin authentication, so that public visitors cannot remove registrations.
25. As a developer, I want registration routes to stay thin, so that request parsing and HTTP error translation are separate from business logic.
26. As a developer, I want registration business rules in a service module, so that duplicate handling, event checks, and authorization can be tested directly.
27. As a developer, I want database constraints to enforce duplicate email and phone rules, so that race conditions do not create duplicate registrations.
28. As a developer, I want database constraint errors translated into precise Dutch API errors, so that users receive useful messages.
29. As a developer, I want the registration API to accept JSON only, so that the request contract stays simple because no files are uploaded.
30. As a developer, I want migrations generated separately after schema changes, so that migration creation stays under developer control for now.

## Implementation Decisions

- Add a public `POST /api/registraties` endpoint.
- `POST /api/registraties` accepts JSON only.
- The create request body includes `event_id`, `firstname`, `lastname`, `email`, `phonenumber`, and `label`.
- `event_id` must be a positive number.
- `firstname` and `lastname` are trimmed and required non-empty strings.
- `email` is required and must be a valid email format.
- `phonenumber` is required, non-empty, and has a maximum length of 14 characters.
- `label` is required and must be one of `Aspirante pioniersstudent` or `Pioniersstudent`.
- The frontend registration form reuses the existing public event detail endpoint to display event title/date and preselect the event label.
- The backend validates that the submitted event exists before creating a registration.
- A missing event returns `404` with a Dutch not-found message.
- The backend rejects registrations for past events.
- A past-event registration attempt returns `400 Bad Request`.
- Public registration creation requires no account and no authentication.
- If a logged-in admin calls the public registration endpoint, the API returns `403 Forbidden` with `Admins kunnen zich niet inschrijven via dit formulier.`
- Duplicate registration is identified by same event plus same email, and same event plus same phone number.
- Replace the current global unique constraints on registration email and phone number with composite unique constraints on event/email and event/phone number.
- Duplicate email for the same event returns `409 Conflict` with `Dit e-mailadres is al ingeschreven voor dit evenement.`
- Duplicate phone number for the same event returns `409 Conflict` with `Dit telefoonnummer is al ingeschreven voor dit evenement.`
- Duplicate detection relies on database unique constraints, with database errors translated into service errors.
- Registrations keep `created_at`; no `updated_at` is added in this PRD.
- Do not generate the Drizzle migration as part of this PRD. The developer will generate the migration separately after schema changes.
- Add admin-only `GET /api/evenementen/[id]/registraties`.
- The event registrations response includes basic event information: title and date.
- The event registrations response includes the registrations array. The frontend can use `registrations.length` for counts when all registrations are loaded.
- Add admin-only `DELETE /api/registraties/[id]`, where `id` is the registration row ID.
- Deleting a registration permanently deletes the row.
- Do not add `GET /api/registraties/[id]` in this PRD.
- Do not add registration update behavior in this PRD.
- Add a registration service module exposing `createRegistration`, `getRegistrationsForEvent`, and `deleteRegistrationById`.
- Route handlers parse/validate input, call service functions, and translate `ServiceError` and `ZodError` using the existing API error response pattern.
- Service functions own event existence checks, past-event checks, authorization checks for admin operations, Drizzle queries, logging, and database error translation.

## Testing Decisions

- Tests should verify external behavior: HTTP responses, status codes, response bodies, database side effects, and authorization outcomes. They should not assert internal implementation details.
- Add route/integration tests for registration creation success.
- Add route/integration tests for missing and invalid required fields.
- Add route/integration tests for invalid email format.
- Add route/integration tests for invalid event IDs.
- Add route/integration tests for non-existing events returning `404`.
- Add route/integration tests for past-event registration returning `400`.
- Add route/integration tests for duplicate event/email returning `409`.
- Add route/integration tests for duplicate event/phone number returning `409`.
- Add route/integration tests proving the same email and phone number can register for different events.
- Add route/integration tests proving admin sessions are rejected on public registration creation.
- Add route/integration tests for admin-only event registration listing.
- Add route/integration tests for unauthenticated/non-admin listing rejection.
- Add route/integration tests for admin-only registration deletion.
- Add route/integration tests for unauthenticated/non-admin deletion rejection.
- Add service-layer tests for `createRegistration`, `getRegistrationsForEvent`, and `deleteRegistrationById`.
- Service-layer tests should cover business rules directly: event existence, past-event rejection, duplicate constraint translation, admin authorization for listing/deletion, and database deletion behavior.
- Existing route tests under `__tests__/routes/` are prior art for HTTP behavior.
- Existing auth helpers under `__tests__/helpers/` are prior art for authenticated admin clients and session setup.

## Out of Scope

- Building the public registration form UI.
- Building the future admin dashboard UI.
- Adding dashboard-wide event registration counts.
- Sending visitor confirmation emails.
- Sending admin emails.
- Creating admin in-app notifications.
- Visitor self-service unregister/cancel after submission.
- Waitlists or event capacity limits.
- Registration status values such as pending, confirmed, cancelled, or waitlisted.
- Admin registration editing.
- Viewing one registration by ID.
- Generating the Drizzle migration directly as part of this PRD.

## Sources

1. User interview in this conversation: original feature request and locked API/business-rule decisions.
2. Git repository: `https://github.com/HeyEdis/pioniersstudenten-site.git` - implementation repository for the Next.js/Bun/Drizzle app.
3. Existing registration schema - showed the current registrations table and global email/phone uniqueness that must change.
4. Existing event API and service patterns - informed route shape, service-layer responsibilities, admin authorization, and error handling style.
5. Existing member API and route tests - informed validation conventions, Dutch error messages, and route/integration testing approach.
6. Existing service error and database error handling modules - informed status-code mapping and database constraint translation approach.

## Further Notes

- The API uses Dutch user-facing messages.
- Event registration count should not be stored in the database. When the frontend has the full registrations array, it can use `registrations.length`.
- If a later dashboard needs counts for many events without loading all registrations, that should be handled by a future dashboard/API PRD with aggregate service queries.
- Email and notification behavior were discussed but explicitly deferred to later work.
