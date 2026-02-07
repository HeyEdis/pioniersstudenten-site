import { integer, pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

const genderTypes = pgEnum("genderTypes", ["Male", "Female", "X"]);

export const membersTable = pgTable("members", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstname: varchar({length: 50}).notNull(),
  lastname: varchar({length: 50}).notNull(),
  gender: genderTypes(),
  email: varchar({length: 255}).notNull().unique(),

})

