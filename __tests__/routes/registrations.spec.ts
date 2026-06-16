import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import { db } from "@/core/db";
import { event, registrations } from "@/drizzle/schema";
import { createRegistration } from "@/service/registrations";
import { eq, inArray } from "drizzle-orm";
import {
  marieRegistration,
  sofieRegistration,
} from "../fixtures/registrationFixture";
import { cleanupAllSessions, createUserSession } from "../helpers/auth";
import { createClient } from "../helpers/setup";

const base_url = process.env.BETTER_AUTH_URL;
const createdRegistrationIds: number[] = [];
const createdEventIds: number[] = [];
const fixtureEmails = [
  marieRegistration.email,
  sofieRegistration.email,
];
let adminClient: Awaited<ReturnType<typeof createClient>>;

const trackRegistration = (id: number) => {
  createdRegistrationIds.push(id);
};

const trackEvent = (id: number) => {
  createdEventIds.push(id);
};

const cleanupRegistrationFixtures = async () => {
  await db
    .delete(registrations)
    .where(inArray(registrations.email, fixtureEmails));
};

beforeEach(async () => {
  await cleanupRegistrationFixtures();
});

beforeAll(async () => {
  await cleanupAllSessions();
  await createUserSession(1);
  adminClient = await createClient("Admin", 1);
});

afterEach(async () => {
  for (const id of createdRegistrationIds.splice(0)) {
    await db.delete(registrations).where(eq(registrations.id, id));
  }
  for (const id of createdEventIds.splice(0)) {
    await db.delete(event).where(eq(event.id, id));
  }
  await cleanupRegistrationFixtures();
});

afterAll(async () => {
  await cleanupAllSessions();
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

const postRegistrationAsAdmin = (body: unknown) => {
  return adminClient(`${base_url}/api/registraties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

const createPastEvent = async () => {
  return createEventWithDate("2020-01-01", "Verlopen registratie event");
};

const createFutureEvent = async () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  return createEventWithDate(
    toLocalDateString(futureDate),
    "Toekomstig registratie event",
  );
};

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createEventWithDate = async (date: string, titlePrefix: string) => {
  const [pastEvent] = await db
    .insert(event)
    .values({
      label: "Aspirante pioniersstudent",
      title: `${titlePrefix} ${crypto.randomUUID()}`,
      date,
      start_time: "10:00:00",
      end_time: "12:00:00",
      description: "Een event voor registratietests.",
      image: null,
    })
    .returning();
  trackEvent(pastEvent.id);
  return pastEvent;
};

describe("Registration service", () => {
  it("creates a registration", async () => {
    const registrationData = marieRegistration;

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
    const registrationData = marieRegistration;

    const created = await createRegistration(registrationData);
    trackRegistration(created.id);

    expect.assertions(1);
    try {
      await createRegistration({
        ...sofieRegistration,
        email: registrationData.email,
      });
    } catch (error) {
      expect(error).toHaveProperty(
        "message",
        "Dit e-mailadres is al ingeschreven voor dit evenement.",
      );
    }
  });

  it("rejects registrations for an event that does not exist", async () => {
    await expect(
      createRegistration({
        ...marieRegistration,
        event_id: 999999,
      }),
    ).rejects.toThrow("Evenement met ID 999999 is niet gevonden.");
  });

  it("rejects registrations for a past event", async () => {
    const pastEvent = await createPastEvent();

    expect.assertions(1);
    try {
      await createRegistration({
        ...marieRegistration,
        event_id: pastEvent.id,
      });
    } catch (error) {
      expect(error).toHaveProperty(
        "message",
        "Inschrijven voor een afgelopen evenement is niet mogelijk.",
      );
    }
  });

  it("allows registrations for an event happening today", async () => {
    const todayEvent = await createEventWithDate(
      toLocalDateString(new Date()),
      "Registratie event vandaag",
    );

    const created = await createRegistration({
      ...marieRegistration,
      event_id: todayEvent.id,
    });
    trackRegistration(created.id);

    expect(created.event_id).toBe(todayEvent.id);
  });

  it("translates duplicate phone number database errors", async () => {
    const created = await createRegistration(marieRegistration);
    trackRegistration(created.id);

    expect.assertions(1);
    try {
      await createRegistration({
        ...sofieRegistration,
        phonenumber: marieRegistration.phonenumber,
      });
    } catch (error) {
      expect(error).toHaveProperty(
        "message",
        "Dit telefoonnummer is al ingeschreven voor dit evenement.",
      );
    }
  });

  it("allows the same email and phone number for different events", async () => {
    const firstRegistration = await createRegistration(marieRegistration);
    trackRegistration(firstRegistration.id);
    const futureEvent = await createFutureEvent();

    const secondRegistration = await createRegistration({
      ...marieRegistration,
      event_id: futureEvent.id,
    });
    trackRegistration(secondRegistration.id);

    expect(secondRegistration.id).not.toBe(firstRegistration.id);

    const persistedRegistrations = await db
      .select()
      .from(registrations)
      .where(eq(registrations.email, marieRegistration.email));

    expect(persistedRegistrations).toHaveLength(2);
    expect(
      persistedRegistrations.map((registration) => registration.event_id),
    ).toContain(1);
    expect(
      persistedRegistrations.map((registration) => registration.event_id),
    ).toContain(futureEvent.id);

    const persistedPhoneRegistrations = await db
      .select()
      .from(registrations)
      .where(eq(registrations.phonenumber, marieRegistration.phonenumber));

    expect(persistedPhoneRegistrations).toHaveLength(2);
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
  }, 15_000);

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

  it("rejects registrations for an event that does not exist", async () => {
    const response = await postRegistration({
      ...marieRegistration,
      event_id: 999999,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);

    const responseBody = await response.json();
    expect(responseBody.message).toBe(
      "Evenement met ID 999999 is niet gevonden.",
    );
  });

  it("rejects registrations for a past event", async () => {
    const pastEvent = await createPastEvent();

    const response = await postRegistration({
      ...marieRegistration,
      event_id: pastEvent.id,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody.message).toBe(
      "Inschrijven voor een afgelopen evenement is niet mogelijk.",
    );
  });

  it("rejects duplicate email addresses for the same event", async () => {
    const firstResponse = await postRegistration(marieRegistration);
    const firstBody = await firstResponse.json();
    trackRegistration(firstBody.registration.id);

    const response = await postRegistration({
      ...sofieRegistration,
      email: marieRegistration.email,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(409);

    const responseBody = await response.json();
    expect(responseBody.message).toBe(
      "Dit e-mailadres is al ingeschreven voor dit evenement.",
    );
  });

  it("rejects duplicate phone numbers for the same event", async () => {
    const firstResponse = await postRegistration(marieRegistration);
    const firstBody = await firstResponse.json();
    trackRegistration(firstBody.registration.id);

    const response = await postRegistration({
      ...sofieRegistration,
      phonenumber: marieRegistration.phonenumber,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(409);

    const responseBody = await response.json();
    expect(responseBody.message).toBe(
      "Dit telefoonnummer is al ingeschreven voor dit evenement.",
    );
  });

  it("allows the same email and phone number for different events", async () => {
    const firstResponse = await postRegistration(marieRegistration);
    const firstBody = await firstResponse.json();
    trackRegistration(firstBody.registration.id);
    const futureEvent = await createFutureEvent();

    const secondResponse = await postRegistration({
      ...marieRegistration,
      event_id: futureEvent.id,
    });
    const secondBody = await secondResponse.json();
    trackRegistration(secondBody.registration.id);

    expect(secondResponse.ok).toBe(true);
    expect(secondResponse.status).toBe(200);

    const persistedRegistrations = await db
      .select()
      .from(registrations)
      .where(eq(registrations.email, marieRegistration.email));

    expect(persistedRegistrations).toHaveLength(2);

    const persistedPhoneRegistrations = await db
      .select()
      .from(registrations)
      .where(eq(registrations.phonenumber, marieRegistration.phonenumber));

    expect(persistedPhoneRegistrations).toHaveLength(2);
  });

  it("rejects admin sessions on public registration creation", async () => {
    const response = await postRegistrationAsAdmin(marieRegistration);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);

    const responseBody = await response.json();
    expect(responseBody.message).toBe(
      "Admins kunnen zich niet inschrijven via dit formulier.",
    );
  });

});
