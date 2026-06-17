import { describe, expect, it } from "bun:test";
import ServiceError from "@/core/serviceError";

describe("ServiceError", () => {
  it("uses 401 for unauthorized errors", () => {
    const error = ServiceError.unauthorized("Niet aangemeld.");

    expect(error.status).toBe(401);
    expect(error.isUnauthorized).toBe(true);
    expect(error.isForbidden).toBe(false);
  });

  it("uses 403 for forbidden errors", () => {
    const error = ServiceError.forbidden("Gebruiker heeft geen toegang.");

    expect(error.status).toBe(403);
    expect(error.isForbidden).toBe(true);
    expect(error.isUnauthorized).toBe(false);
  });

  it("exposes status helpers for expected service errors", () => {
    const notFound = ServiceError.notFound("Niet gevonden.");
    const badRequest = ServiceError.badRequest("Ongeldige aanvraag.");
    const internal = ServiceError.internalServerError("Serverfout.");
    const conflict = ServiceError.conflict("Conflict.");

    expect(notFound.status).toBe(404);
    expect(notFound.isNotFound).toBe(true);
    expect(badRequest.status).toBe(400);
    expect(badRequest.isBadRequest).toBe(true);
    expect(internal.status).toBe(500);
    expect(internal.isInternalServerError).toBe(true);
    expect(conflict.status).toBe(409);
    expect(conflict.isConflict).toBe(true);
  });
});
