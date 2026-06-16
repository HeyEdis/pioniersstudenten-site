import { db } from "@/core/db";
import { auth } from "@/core/auth";
import { getLogger } from "@/core/logging";
import ServiceError from "@/core/serviceError";
import { event, registrations } from "@/drizzle/schema";
import type { Registration } from "@/drizzle/zod";
import type { EventRegistrationList } from "@/types/registration";
import handleDBError from "./_handleDbErrors";
import { eq } from "drizzle-orm";

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeEventDate = (eventDate: string) => {
  const dateOnly = eventDate.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return dateOnly;
  }

  return toLocalDateString(new Date(eventDate));
};

const isPastEventDate = (eventDate: string) => {
  return normalizeEventDate(eventDate) < toLocalDateString(new Date());
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

  if (session?.user.role === "Admin") {
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

  if (session?.user.role !== "Admin") {
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
