import { db } from "@/core/db";
import { auth } from "@/core/auth";
import { getLogger } from "@/core/logging";
import ServiceError from "@/core/serviceError";
import { event, registrations, userRole } from "@/drizzle/schema";
import type { Registration } from "@/drizzle/zod";
import type { EventRegistrationList } from "@/types/registration";
import handleDBError from "./_handleDbErrors";
import { and, eq } from "drizzle-orm";
import dayjs from "dayjs";

const isPastEventDate = (eventDate: string): boolean => {
  return dayjs(eventDate).isBefore(dayjs(), "day");
};

export const createRegistration = async (
  params: typeof registrations.$inferInsert,
  headers?: Headers,
): Promise<Registration> => {
  const session = headers
    ? await auth.api.getSession({
        headers,
      })
    : null;

  if (session?.user.role === userRole.enumValues[0]) {
    throw ServiceError.forbidden(
      "Admins kunnen zich niet inschrijven via dit formulier.",
    );
  }

  const [eventById] = await db
    .select()
    .from(event)
    .where(eq(event.id, params.event_id));

  if (!eventById) {
    getLogger().warn(`Event ${params.event_id} wasn't found.`);
    throw ServiceError.notFound(
      `Evenement met ID ${params.event_id} is niet gevonden.`,
    );
  }

  if (isPastEventDate(eventById.date)) {
    throw ServiceError.badRequest(
      "Inschrijven voor een afgelopen evenement is niet mogelijk.",
    );
  }

  const [registrationWithEmail] = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(
      and(
        eq(registrations.event_id, params.event_id),
        eq(registrations.email, params.email),
      ),
    );

  if (registrationWithEmail) {
    throw ServiceError.conflict(
      "Dit e-mailadres is al ingeschreven voor dit evenement.",
    );
  }

  const [registrationWithPhoneNumber] = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(
      and(
        eq(registrations.event_id, params.event_id),
        eq(registrations.phonenumber, params.phonenumber),
      ),
    );

  if (registrationWithPhoneNumber) {
    throw ServiceError.conflict(
      "Dit telefoonnummer is al ingeschreven voor dit evenement.",
    );
  }

  try {
    const [created] = await db
      .insert(registrations)
      .values(params)
      .returning();

    getLogger().info(`200: Registration ${created.id} is created.`);
    return created;
  } catch (error) {
    getLogger().error(error);
    throw handleDBError(error);
  }
};

export const getRegistrationsForEvent = async (
  eventId: number,
  headers: Headers,
): Promise<EventRegistrationList> => {
  const session = await auth.api.getSession({ headers });

  if (session?.user.role !== userRole.enumValues[0]) {
    throw ServiceError.forbidden("Gebruiker heeft geen toegang.");
  }

  const [eventById] = await db
    .select({
      id: event.id,
      title: event.title,
      date: event.date,
    })
    .from(event)
    .where(eq(event.id, eventId));

  if (!eventById) {
    getLogger().warn(`Event ${eventId} wasn't found.`);
    throw ServiceError.notFound(
      `Evenement met ID ${eventId} is niet gevonden.`,
    );
  }

  const eventRegistrations = await db
    .select()
    .from(registrations)
    .where(eq(registrations.event_id, eventId))
    .orderBy(registrations.id);

  return {
    event: eventById,
    registrations: eventRegistrations,
  };
};

export const deleteRegistrationById = async (
  registrationId: number,
  headers: Headers,
): Promise<void> => {
  const session = await auth.api.getSession({ headers });

  if (session?.user.role !== userRole.enumValues[0]) {
    getLogger().warn(
      `Forbidden registration delete attempt for registration ${registrationId}.`,
    );
    throw ServiceError.forbidden("Gebruiker heeft geen toegang.");
  }

  const [registrationById] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, registrationId));

  if (!registrationById) {
    getLogger().warn(`Registration ${registrationId} wasn't found.`);
    throw ServiceError.notFound(
      `Inschrijving met ID ${registrationId} is niet gevonden.`,
    );
  }

  try {
    await db.delete(registrations).where(eq(registrations.id, registrationId));
    getLogger().info(`200: Registration ${registrationId} is deleted.`);
  } catch (error) {
    getLogger().error(error);
    throw handleDBError(error);
  }
};
