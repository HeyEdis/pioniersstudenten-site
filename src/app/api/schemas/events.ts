import { z } from "zod";

export const EventByIdQuerySchema = z.object({
  id: z.coerce.number(),
});