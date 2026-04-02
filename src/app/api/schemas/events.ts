import { z } from "zod";

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const EventByIdQuerySchema = z.object({
  id: z.coerce.number(),
});

export const EventImageSchema = z.object({
  image: z
    .any()
    .refine((file) => file.size <= MAX_SIZE, `Maximum grootte van een afbeelding is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Allen .jpg, .jpeg, .png and .webp formaten zijn toegestaan."
    )
})