import { pioneerLabel } from "@/drizzle/schema";
import { z } from "zod";

export const RegistrationCreateSchema = z.object({
  event_id: z.coerce
    .number({
      error: "Evenement ID moet een getal zijn.",
    })
    .int("Evenement ID moet een geheel getal zijn.")
    .positive("Evenement ID moet een positief getal zijn."),
  firstname: z.string().trim().nonempty("Voornaam mag niet leeg zijn."),
  lastname: z.string().trim().nonempty("Achternaam mag niet leeg zijn."),
  email: z
    .string()
    .trim()
    .nonempty("E-mailadres is verplicht.")
    .email("E-mailadres is ongeldig."),
  phonenumber: z
    .string()
    .trim()
    .nonempty("Gsm-nummer mag niet leeg zijn.")
    .max(14, "Gsm-nummer mag maximaal 14 tekens bevatten."),
  label: z.enum(pioneerLabel.enumValues, {
    error: "Ongeldig label.",
  }),
});
