import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const membersTable = pgTable("members", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstname: varchar({length: 50}).notNull(),
  lastname: varchar({length: 50}).notNull(),
})