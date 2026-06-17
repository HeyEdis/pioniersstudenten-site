import { z } from "zod";

export const RegistrationByIdQuerySchema = z.object({
  id: z.coerce
    .number({
      error: "Inschrijving ID moet een getal zijn.",
    })
    .int("Inschrijving ID moet een geheel getal zijn.")
    .positive("Inschrijving ID moet een positief getal zijn."),
});
