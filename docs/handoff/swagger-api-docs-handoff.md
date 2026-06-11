# Swagger / OpenAPI Handoff

## Context

The user asked for guidance on whether and when to add Swagger/OpenAPI documentation to this project. No implementation was requested. The discussion was conceptual and should inform a future `AGENTS.md` convention or a later implementation pass.

The project is expected to have about 7 API endpoints total. The user is working in a team of three and wants future agents/developers to understand the API without reverse-engineering every route.

## Decisions Reached

- Swagger/OpenAPI should not be set up immediately while endpoint shapes are still changing.
- Because the API surface is small, it is reasonable to add Swagger after the planned endpoints are mostly written and request/response contracts have settled.
- Swagger/OpenAPI should be added before final handoff, review, or grading so another developer/teacher/future agent can understand and test the API.
- Do not use large Swagger comment blocks above service functions.
- Prefer keeping OpenAPI definitions outside route handlers and service files.
- Use schema/code-based generation for the Swagger/OpenAPI setup. Define schemas in code, preferably with Zod, and generate the reusable schema parts of the OpenAPI document from those schemas.
- Keep manual OpenAPI metadata limited to what schema generation cannot know: URL, HTTP method, auth rules, descriptions, status codes, examples, JSON versus `FormData`, and file fields.
- If Swagger is added later, a suitable structure would be:

```txt
src/docs/openapi/
  document.ts
  schemas.ts
  paths/events.ts
src/app/api/openapi/route.ts
src/app/api-docs/page.tsx
```

## Explanation Given To User

Swagger is tooling around OpenAPI, a standard way to describe an API contract: endpoints, methods, request bodies, responses, status codes, auth requirements, and errors.

Benefits of API documentation:

- Faster onboarding for future developers and agents.
- Less confusion between frontend and backend.
- Clearer request/response expectations.
- Easier testing and review.
- Better communication of auth, validation, file upload, and error behavior.
- API behavior becomes explicit instead of hidden in route/service code.

A teacher would include Swagger/OpenAPI in a curriculum because it teaches that APIs are contracts, not just backend implementation details.

## Generation Clarification

Swagger does not automatically understand a project by itself. Something must describe the API contract.

Chosen approach:

- Schema/code-based generation: define schemas in code, usually with Zod, and generate parts of the OpenAPI spec from those schemas.
- This reduces duplication between validation and documentation.
- It takes more setup than a manual OpenAPI file.
- It still needs manual endpoint metadata like URL, method, auth, descriptions, status codes, and examples.

Even with schema/code-based generation, these still need explicit documentation:

- Endpoint descriptions.
- Auth requirements.
- Status codes.
- Examples.
- JSON versus `FormData`.
- File upload fields.
- Error responses.

## Suggested Skills

- `grill-me`: Use if the user wants to stress-test the exact Swagger setup before implementing it.
- `diagnose`: Use only if a future Swagger/OpenAPI implementation fails or generated docs do not match the API.
- `handoff`: Use again after the Swagger implementation decision or setup is completed.
