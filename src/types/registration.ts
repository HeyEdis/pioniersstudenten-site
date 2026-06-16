import type { Event, Registration } from "@/drizzle/zod";

export interface EventRegistrationList {
  event: Pick<Event, "id" | "title" | "date">;
  registrations: Registration[];
}
