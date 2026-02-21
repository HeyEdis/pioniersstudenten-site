import { z } from "zod";

export const MemberByIdQuerySchema = z.object({
  id: z.coerce.number(),
});