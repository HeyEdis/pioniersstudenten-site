import { z } from "zod";

export const EventByIdQuerySchema = z.object({
  id: z.coerce.number(),
});

// export const commentCreateOrUpdateInput = z
//   .object({
//     userId: z.number().int(),
//     message: z.string().openapi({ example: "New comment" }),
//     maintenanceId: z.number(),
//   })
//   .openapi({ ref: "commentCreateInput" });

// export const commentCreateBodySchema = z
//   .object({
//     //userId: z.number().int(),
//     message: z.string(),
//     maintenanceId: z.number(),
//   })
//   .strict()
//   .openapi({ ref: "CommentCreateBodySchema" });
