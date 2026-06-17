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
import {
  createRegistration,
  deleteRegistrationById,
  getRegistrationsForEvent,
} from "@/service/registrations";
import { eq, inArray } from "drizzle-orm";
import {
  marieRegistration,
  sofieRegistration,
} from "../fixtures/registrationFixture";
import { cleanupAllSessions, createUserSession } from "../helpers/auth";
import { createSessionHeaders } from "../helpers/setup";
import dayjs from "dayjs";

const createdRegistrationIds: number[] = [];
const createdEventIds: number[] = [];
const fixtureEmails = [
  marieRegistration.email,
  sofieRegistration.email,
];

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

const createPastEvent = async () => {
  const pastDate = dayjs().subtract(3, "day").format("YYYY-MM-DD");
  return createEventWithDate(pastDate, "Verlopen registratie event");
};

const createFutureEvent = async () => {
  const futureDate = dayjs().add(30, "day").format("YYYY-MM-DD");
  return createEventWithDate(futureDate, "Toekomstig registratie event");
};

const currentDate = dayjs().format("YYYY-MM-DD");

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

  it("rejects duplicate email addresses for the same event", async () => {
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
      currentDate,
      "Registratie event vandaag",
    );

    const created = await createRegistration({
      ...marieRegistration,
      event_id: todayEvent.id,
    });
    trackRegistration(created.id);

    expect(created.event_id).toBe(todayEvent.id);
  });

  it("rejects duplicate phone numbers for the same event", async () => {
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

  it("returns event context and registrations for one event to admins", async () => {
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
    const headers = await createSessionHeaders("Admin", 1);

    const result = await getRegistrationsForEvent(registrationEvent.id, headers);

    expect(result.event.title).toBe(registrationEvent.title);
    expect(result.event.date).toBe(registrationEvent.date);
    expect(result.registrations).toHaveLength(2);
    expect(result.registrations.map((registration) => registration.id)).toEqual(
      expect.arrayContaining([firstRegistration.id, secondRegistration.id]),
    );
    expect(
      result.registrations.map((registration) => registration.id),
    ).not.toContain(otherRegistration.id);
  });

  it("rejects event registration listing without an admin session", async () => {
    await expect(
      getRegistrationsForEvent(1, new Headers()),
    ).rejects.toMatchObject({
      status: 403,
      message: "Gebruiker heeft geen toegang.",
    });
  });

  it("rejects event registration listing when the event does not exist", async () => {
    const headers = await createSessionHeaders("Admin", 1);

    await expect(
      getRegistrationsForEvent(999999, headers),
    ).rejects.toMatchObject({
      status: 404,
      message: "Evenement met ID 999999 is niet gevonden.",
    });
  });

  it("deletes a registration as an admin", async () => {
    const created = await createRegistration(marieRegistration);
    const headers = await createSessionHeaders("Admin", 1);

    await deleteRegistrationById(created.id, headers);

    const [registrationInDb] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, created.id));

    expect(registrationInDb).toBeUndefined();
  });

  it("rejects registration deletion without an admin session", async () => {
    await expect(
      deleteRegistrationById(1, new Headers()),
    ).rejects.toMatchObject({
      status: 403,
      message: "Gebruiker heeft geen toegang.",
    });
  });

  it("rejects registration deletion when the registration does not exist", async () => {
    const headers = await createSessionHeaders("Admin", 1);

    await expect(
      deleteRegistrationById(999999, headers),
    ).rejects.toMatchObject({
      status: 404,
      message: "Inschrijving met ID 999999 is niet gevonden.",
    });
  });
});
