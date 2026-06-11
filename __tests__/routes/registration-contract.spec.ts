import { describe, expect, it } from "bun:test";
import { RegistrationCreateSchema } from "@/app/api/schemas/registrations";
import { registrations } from "@/drizzle/schema";
import handleDBError from "@/service/_handleDbErrors";

const validRegistration = {
  event_id: 1,
  firstname: "  Marie  ",
  lastname: "  Peeters  ",
  email: "marie.peeters@example.com",
  phonenumber: "0470123456",
  label: "Aspirante pioniersstudent",
};

const getRegistrationConstraintNames = () => {
  const extraConfigColumns = (
    registrations as unknown as {
      [key: symbol]: typeof registrations;
    }
  )[Symbol.for("drizzle:ExtraConfigColumns")];
  const extraConfigBuilder = (
    registrations as unknown as {
      [key: symbol]: (table: typeof extraConfigColumns) => unknown[];
    }
  )[Symbol.for("drizzle:ExtraConfigBuilder")];

  return extraConfigBuilder(extraConfigColumns).map((constraint) => {
    return (constraint as { config: { name: string } }).config.name;
  });
};

describe("Registration contract", () => {
  it("validates and trims public registration creation input", () => {
    const parsed = RegistrationCreateSchema.parse(validRegistration);

    expect(parsed).toEqual({
      ...validRegistration,
      firstname: "Marie",
      lastname: "Peeters",
    });
  });

  it("rejects invalid public registration creation input", () => {
    const result = RegistrationCreateSchema.safeParse({
      event_id: 0,
      firstname: "   ",
      lastname: "",
      email: "not-an-email",
      phonenumber: "00324701234567890",
      label: "Vrijwilliger",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          "Evenement ID moet een positief getal zijn.",
          "Voornaam mag niet leeg zijn.",
          "Achternaam mag niet leeg zijn.",
          "E-mailadres is ongeldig.",
          "Gsm-nummer mag maximaal 14 tekens bevatten.",
          "Ongeldig label.",
        ]),
      );
    }
  });

  it("defines event-scoped unique constraints for registration email and phone", () => {
    const constraintNames = getRegistrationConstraintNames();

    expect(constraintNames).toContain("registrations_event_email_unique");
    expect(constraintNames).toContain("registrations_event_phonenumber_unique");
  });

  it("translates event-scoped duplicate registration email errors", () => {
    const error = new Error(
      'duplicate key value violates unique constraint "registrations_event_email_unique"',
    );
    Object.assign(error, { code: "23505" });

    expect(() => handleDBError(error)).toThrow(
      "Dit e-mailadres is al ingeschreven voor dit evenement.",
    );
  });

  it("translates event-scoped duplicate registration phone errors", () => {
    const error = new Error(
      'duplicate key value violates unique constraint "registrations_event_phonenumber_unique"',
    );
    Object.assign(error, { code: "23505" });

    expect(() => handleDBError(error)).toThrow(
      "Dit telefoonnummer is al ingeschreven voor dit evenement.",
    );
  });
});
