import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { db } from "@/core/db";
import { registrations } from "@/drizzle/schema";
import { create } from "@/service/registrations";
import { eq, inArray } from "drizzle-orm";
import { marieRegistration, sofieRegistration } from "../fixtures/registrationFixture";

const base_url = process.env.BETTER_AUTH_URL;
const createdRegistrationIds: number[] = [];
const fixtureEmails = [
  marieRegistration.email,
  sofieRegistration.email,
];

const trackRegistration = (id: number) => {
  createdRegistrationIds.push(id);
};

const cleanupRegistrationFixtures = async () => {
  await db
    .delete(registrations)
    .where(inArray(registrations.email, fixtureEmails));
};

beforeEach(async () => {
  await cleanupRegistrationFixtures();
});

afterEach(async () => {
  for (const id of createdRegistrationIds.splice(0)) {
    await db.delete(registrations).where(eq(registrations.id, id));
  }
  await cleanupRegistrationFixtures();
});

const postRegistration = (body: unknown) => {
  return fetch(`${base_url}/api/registraties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

describe("Registration service", () => {
  it("creates a registration", async () => {
    const registrationData = marieRegistration;

    const created = await create(registrationData);
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
    const registrationData = marieRegistration;

    const created = await create(registrationData);
    trackRegistration(created.id);

    await expect(create(registrationData)).rejects.toThrow(
      "Dit e-mailadres is al ingeschreven voor dit evenement.",
    );
  });
});

describe("Registration routes", () => {
  it("creates a registration from JSON", async () => {
    const registrationData = sofieRegistration;

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
      ...marieRegistration,
      firstname: undefined,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: expect.arrayContaining([expect.any(String)]),
    });
  });

});
