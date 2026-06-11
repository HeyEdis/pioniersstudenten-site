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
});
