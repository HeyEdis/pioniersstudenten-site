import { describe, expect, it } from "bun:test";
import handleDBError from "@/service/_handleDbErrors";
import ServiceError from "@/core/serviceError";

const dbError = (code: string, message: string) => {
  const error = new Error(message);
  Object.assign(error, { code });
  return error;
};

const expectServiceError = (
  run: () => void,
  expectedStatus: number,
  expectedMessage: string,
) => {
  try {
    run();
    throw new Error("Expected handleDBError to throw.");
  } catch (error) {
    expect(error).toBeInstanceOf(ServiceError);
    expect((error as ServiceError).status).toBe(expectedStatus);
    expect((error as Error).message).toBe(expectedMessage);
  }
};

describe("Database error handling", () => {
  it("translates known unique constraint violations", () => {
    expectServiceError(
      () => handleDBError(dbError("23505", "members_email_unique")),
      400,
      "Dit e-mail adres is al in gebruik.",
    );
    expectServiceError(
      () => handleDBError(dbError("23505", "events_title_unique")),
      400,
      "Een event bestaat al met deze titel.",
    );
    expectServiceError(
      () => handleDBError(dbError("23505", "members_phonenumber_unique")),
      400,
      "Dit telefoonnummer is al geregistreerd.",
    );
    expectServiceError(
      () => handleDBError(dbError("23505", "other_unique")),
      400,
      "Dit item bestaat al.",
    );
  });

  it("translates not-found database errors", () => {
    expectServiceError(
      () => handleDBError(dbError("20000", "events")),
      404,
      "Dit event bestaat niet.",
    );
    expectServiceError(
      () => handleDBError(dbError("20000", "registrations")),
      404,
      "Deze inschrijving bestaat niet.",
    );
    expectServiceError(
      () => handleDBError(dbError("20000", "members")),
      404,
      "Dit lid bestaat niet.",
    );
    expectServiceError(
      () => handleDBError(dbError("20000", "unknown")),
      404,
      "Het opgevraagde item bestaat niet.",
    );
  });

  it("translates foreign-key database errors", () => {
    expectServiceError(
      () => handleDBError(dbError("23503", "events")),
      409,
      "Dit event bestaat niet of is niet gelinkt met een registratie.",
    );
    expectServiceError(
      () => handleDBError(dbError("23503", "registrations")),
      409,
      "Deze registratie bestaat niet of is niet gelinkt met een event.",
    );
    expectServiceError(
      () => handleDBError(dbError("23503", "unknown")),
      409,
      "Er is een probleem met een gelinkte item.",
    );
  });

  it("rethrows unknown errors", () => {
    const plainError = new Error("Boom");
    const unknownDbError = dbError("99999", "unknown");

    expect(() => handleDBError(plainError)).toThrow(plainError);
    expect(() => handleDBError(unknownDbError)).toThrow(unknownDbError);
  });
});
