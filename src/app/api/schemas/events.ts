// import { z } from "zod";

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

// export const eventById = z
//   .object({
//     id: z.coerce.number(),
//   })
//   .openapi({ ref: "commentGetById" });

// export const commentsReturnSchema = CommentsSchema.openapi({
//   ref: "CommentsReturn",
// });

// export const commentsPerMaintenanceIdQuerySchema = z.object({
//   maintenanceId: z.coerce.number(),
// });
