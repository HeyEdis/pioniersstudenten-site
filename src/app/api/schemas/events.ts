import { z } from "zod";

export const EventByIdQuerySchema = z.object({
  id: z.coerce.number(),
});

export const EventRegistrationsByEventIdQuerySchema = z.object({
  id: z.coerce
    .number({
      error: "Evenement ID moet een getal zijn.",
    })
    .int("Evenement ID moet een geheel getal zijn.")
    .positive("Evenement ID moet een positief getal zijn."),
});
