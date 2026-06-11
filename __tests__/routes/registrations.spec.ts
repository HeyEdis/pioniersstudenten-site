import { afterEach, describe, expect, it } from "bun:test";
import { db } from "@/core/db";
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

const postRegistration = (body: unknown, contentType = "application/json") => {
  return fetch(`${base_url}/api/registraties`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
};

describe("Registration service", () => {
  it("creates a registration", async () => {
    const registrationData = makeRegistrationFixture();

    const created = await createRegistration(registrationData);
    trackRegistration(created.id);

    expect(created.id).toBeNumber();
    expect(created.email).toBe(registrationData.email);
    expect(created.phonenumber).toBe(registrationData.phonenumber);
    expect(created.label).toBe(registrationData.label);

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

    await expect(createRegistration(registrationData)).rejects.toThrow(
      "Dit e-mailadres is al ingeschreven voor dit evenement.",
    );
  });
});

describe("Registration routes", () => {
  it("creates a registration from JSON", async () => {
    const registrationData = makeRegistrationFixture();

    const response = await postRegistration(registrationData);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    trackRegistration(responseBody.registration.id);

    expect(responseBody.registration.email).toBe(registrationData.email);
    expect(responseBody.registration.phonenumber).toBe(registrationData.phonenumber);
    expect(responseBody.registration.label).toBe(registrationData.label);

    const [registrationInDb] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, responseBody.registration.id));

    expect(registrationInDb).toBeDefined();
    expect(registrationInDb.email).toBe(registrationData.email);
  });

  it("rejects missing required fields", async () => {
    const response = await postRegistration({
      ...makeRegistrationFixture(),
      firstname: undefined,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: expect.arrayContaining([expect.any(String)]),
    });
  });

  it("rejects malformed JSON", async () => {
    const response = await postRegistration("not-valid-json");

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody.message).toBe("Ongeldige JSON body.");
  });

  it("rejects non-JSON request bodies", async () => {
    const response = await postRegistration("not json", "text/plain");

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody.message).toBe("Content-Type moet application/json zijn.");
  });
});
