import { AddressSelectSchema, MemberSelectSchema } from "@/drizzle/zod";
import { z } from "zod";

export const MemberByIdQuerySchema = z.object({
  id: z.coerce.number(),
});

export const MemberByIdResponseSchema = z.object({
  members: MemberSelectSchema,
  address: AddressSelectSchema.nullable(),
});