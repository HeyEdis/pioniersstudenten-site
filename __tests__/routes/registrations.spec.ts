import { afterEach, describe, expect, it } from "bun:test";
import { db } from "@/core/db";
import ServiceError from "@/core/serviceError";
import { registrations } from "@/drizzle/schema";
import { createRegistration } from "@/service/registrations";
import { eq } from "drizzle-orm";
import { makeRegistrationFixture } from "../fixtures/registrationFixture";

const base_url = process.env.BETTER_AUTH_URL;
const createdRegistrationIds: number[] = [];

const trackRegistration = (id: number) => {
  createdRegistrationIds.push(id);
};

afterEach(async () => {
  for (const id of createdRegistrationIds.splice(0)) {
    await db.delete(registrations).where(eq(registrations.id, id));
  }
});

describe("Registration service", () => {
  it("creates a registration", async () => {
    const registrationData = makeRegistrationFixture();

    const created = await createRegistration(registrationData);
    trackRegistration(created.id);

    expect(created).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        event_id: registrationData.event_id,
        firstname: registrationData.firstname,
        lastname: registrationData.lastname,
        email: registrationData.email,
        phonenumber: registrationData.phonenumber,
        label: registrationData.label,
      }),
    );

    const [registrationInDb] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, created.id));

    expect(registrationInDb).toBeDefined();
    expect(registrationInDb.email).toBe(registrationData.email);
  });

  it("translates database insert errors", async () => {
    const registrationData = makeRegistrationFixture();

    const created = await createRegistration(registrationData);
    trackRegistration(created.id);

    try {
      await createRegistration(registrationData);
      throw new Error("Expected duplicate registration to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceError);
      expect((error as ServiceError).status).toBe(409);
      expect((error as ServiceError).message).toBe(
        "Dit e-mailadres is al ingeschreven voor dit evenement.",
      );
    }
  });
});

describe("Registration routes", () => {
  it("creates a registration from JSON", async () => {
    const registrationData = makeRegistrationFixture();

    const response = await fetch(`${base_url}/api/registraties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    trackRegistration(responseBody.registration.id);

    expect(responseBody.registration).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        event_id: registrationData.event_id,
        firstname: registrationData.firstname,
        lastname: registrationData.lastname,
        email: registrationData.email,
        phonenumber: registrationData.phonenumber,
        label: registrationData.label,
      }),
    );

    const [registrationInDb] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, responseBody.registration.id));

    expect(registrationInDb).toBeDefined();
    expect(registrationInDb.email).toBe(registrationData.email);
  });

  it("rejects missing required fields", async () => {
    const registrationData = makeRegistrationFixture();
    const missingFirstname: Partial<typeof registrationData> = { ...registrationData };
    delete missingFirstname.firstname;

    const response = await fetch(`${base_url}/api/registraties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(missingFirstname),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: expect.arrayContaining([expect.any(String)]),
    });
  });

  it("rejects malformed JSON", async () => {
    const response = await fetch(`${base_url}/api/registraties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{",
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody.message).toBe("Ongeldige JSON body.");
  });

  it("rejects non-JSON request bodies", async () => {
    const response = await fetch(`${base_url}/api/registraties`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: "not json",
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody.message).toBe("Content-Type moet application/json zijn.");
  });
});
