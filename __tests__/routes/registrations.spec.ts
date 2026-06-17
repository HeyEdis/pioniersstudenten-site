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
import { event, registrations, userRole } from "@/drizzle/schema";
import { createRegistration } from "@/service/registrations";
import { eq, inArray } from "drizzle-orm";
import {
  marieRegistration,
  sofieRegistration,
} from "../fixtures/registrationFixture";
import { cleanupAllSessions, createUserSession } from "../helpers/auth";
import { createClient } from "../helpers/setup";
import dayjs from "dayjs";

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
  adminClient = await createClient(userRole.enumValues[0], 1);
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

const getEventRegistrationsAsAdmin = (eventId: number | string) => {
  return adminClient(`${base_url}/api/evenementen/${eventId}/registraties`);
};

const getEventRegistrations = (eventId: number | string) => {
  return fetch(`${base_url}/api/evenementen/${eventId}/registraties`);
};

const deleteRegistrationAsAdmin = (registrationId: number | string) => {
  return adminClient(`${base_url}/api/registraties/${registrationId}`, {
    method: "DELETE",
  });
};

const deleteRegistration = (registrationId: number | string) => {
  return fetch(`${base_url}/api/registraties/${registrationId}`, {
    method: "DELETE",
  });
};

const createPastEvent = async () => {
  const pastDate = dayjs().subtract(3, "day").format("YYYY-MM-DD");
  return createEventWithDate(pastDate, "Verlopen registratie event");
};

const createFutureEvent = async () => {
  const futureDate = dayjs().add(30, "day").format("YYYY-MM-DD");
  return createEventWithDate(futureDate, "Toekomstig registratie event");
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

describe("Registration routes", () => {
  it("creates a registration from JSON", async () => {
    const registrationData = sofieRegistration;

    const response = await postRegistration(registrationData);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    trackRegistration(responseBody.registration.id);

    expect(responseBody.registration.email).toBe(registrationData.email);
    expect(responseBody.registration.phonenumber).toBe(
      registrationData.phonenumber,
    );
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

  it("lists registrations for one event as admin", async () => {
    const registrationEvent = await createFutureEvent();
    const otherEvent = await createFutureEvent();
    const firstRegistration = await createRegistration({
      ...marieRegistration,
      event_id: registrationEvent.id,
    });
    trackRegistration(firstRegistration.id);
    const secondRegistration = await createRegistration({
      ...sofieRegistration,
      event_id: registrationEvent.id,
    });
    trackRegistration(secondRegistration.id);
    const otherRegistration = await createRegistration({
      ...marieRegistration,
      event_id: otherEvent.id,
    });
    trackRegistration(otherRegistration.id);

    const response = await getEventRegistrationsAsAdmin(registrationEvent.id);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.event.title).toBe(registrationEvent.title);
    expect(responseBody.event.date).toBe(registrationEvent.date);
    expect(responseBody.registrations).toHaveLength(2);
    expect(
      responseBody.registrations.map(
        (registration: { id: number }) => registration.id,
      ),
    ).toEqual(
      expect.arrayContaining([firstRegistration.id, secondRegistration.id]),
    );
    expect(
      responseBody.registrations.map(
        (registration: { id: number }) => registration.id,
      ),
    ).not.toContain(otherRegistration.id);
  }, 15_000);

  it("rejects unauthenticated event registration listing", async () => {
    const response = await getEventRegistrations(1);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);

    const responseBody = await response.json();
    expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
  });

  it("rejects invalid event IDs for registration listing", async () => {
    const response = await getEventRegistrationsAsAdmin("abc");

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: expect.arrayContaining([expect.any(String)]),
    });
  });

  it("rejects negative event IDs for registration listing", async () => {
    const response = await getEventRegistrationsAsAdmin("-1");

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it("rejects registration listing for an event that does not exist", async () => {
    const response = await getEventRegistrationsAsAdmin(999999);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);

    const responseBody = await response.json();
    expect(responseBody.message).toBe(
      "Evenement met ID 999999 is niet gevonden.",
    );
  });

  it("deletes a registration as admin", async () => {
    const created = await createRegistration(marieRegistration);

    const response = await deleteRegistrationAsAdmin(created.id);

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toEqual({ id: created.id });

    const [registrationInDb] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, created.id));

    expect(registrationInDb).toBeUndefined();
  }, 15_000);

  it("rejects unauthenticated registration deletion", async () => {
    const response = await deleteRegistration(1);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(403);

    const responseBody = await response.json();
    expect(responseBody.message).toBe("Gebruiker heeft geen toegang.");
  });

  it("rejects invalid registration IDs for deletion", async () => {
    const response = await deleteRegistrationAsAdmin("abc");

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toEqual({
      message: expect.arrayContaining([expect.any(String)]),
    });
  });

  it("rejects negative registration IDs for deletion", async () => {
    const response = await deleteRegistrationAsAdmin("-1");

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it("rejects deletion for a registration that does not exist", async () => {
    const response = await deleteRegistrationAsAdmin(999999);

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);

    const responseBody = await response.json();
    expect(responseBody.message).toBe(
      "Inschrijving met ID 999999 is niet gevonden.",
    );
  });
});
