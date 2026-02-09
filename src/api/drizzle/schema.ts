import { relations } from "drizzle-orm";
import { boolean, date, integer, pgEnum, pgTable, text, time, timestamp, varchar } from "drizzle-orm/pg-core";

export const genderTypes = pgEnum("genderTypes", ["Male", "Female", "X"]);
export const resourceTypes = pgEnum("resourceTypes", ["Studentenlink", "Ondersteuning"]);
export const pioneerLabel = pgEnum("pioneerLabel",["Toekomstige pioniersstudent", "Pioniersstudent"]);
export const userRole = pgEnum("userRole", ["Admin"]);

const timestamps = {
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
};

export const members = pgTable("members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(), // so it autoincrements
  address_id: integer("address_id").references(() => address.id).notNull(), // given it an FK constraint
  firstname: varchar("firstname", {length: 50}).notNull(),
  lastname: varchar("lastname", {length: 50}).notNull(),
  gender: genderTypes("gender").notNull(),
  email: varchar("email", {length: 255}).notNull().unique(),
  phonenumber: varchar("phonenumber", {length:14}).notNull(),
  has_payed: boolean("has_payed"),
  is_student: boolean("is_student"),
  ...timestamps
});

// Many-to-one: maps the members adress_id to the address tables primary key.
export const membersRelations = relations(members, ({one}) => ({
  address: one(address, {
    fields: [members.address_id],
    references: [address.id],
  }),
}))

export const address = pgTable("addresses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(), 
  street: varchar("street", {length: 255}).notNull(),
  housenumber: varchar("housenumber", {length: 10}).notNull(),
  city: varchar("city", {length: 80}).notNull(),
  province: varchar("province", {length: 80}).notNull()
});

// One address can have many members
export const addressRelations = relations(address, ({many}) => ({
  members: many(members),
}));

export const faq = pgTable("faq", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(), 
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  ...timestamps
});

export const resource = pgTable("resources", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: resourceTypes("type"),
  title: varchar("title", {length:200}).notNull(),
  url: text("url").notNull(),
  ...timestamps
});

export const admin = pgTable("admins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", {length: 255}).notNull().unique(),
  role: userRole(),
  password_hash: text("password_hash").notNull(),
  ...timestamps
});

export const registrations = pgTable("registrations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  event_id: integer("event_id").references(() => event.id).notNull(), // given the id an FK constraint
  firstname: varchar("firstname", {length: 50}).notNull(),
  lastname: varchar("lastname", {length: 50}).notNull(),
  email: varchar("email", {length: 255}).notNull().unique(),
  phonenumber: varchar("phonenumber", {length:14}).notNull(),
  label: pioneerLabel("label"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Many-to-one: maps the event_id to the event table primary key.
export const registrationRelations = relations(registrations, ({one}) => ({
  event: one(event, {
    fields: [registrations.event_id],
    references: [event.id],
  }),
}))

export const event = pgTable("events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  label: pioneerLabel("label"),
  title: varchar("title", {length:200}).notNull(),
  date: date("date").notNull(),
  start_time: time("start_time").notNull(),
  end_time: time("end_time").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  ...timestamps
});

// One event can have many eventRegistrations
export const eventRelations = relations(event, ({many}) => ({
  registration: many(registrations),
}));

export const notification = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  member_id: integer("member_id").references(() => members.id), // given the id an FK constraint,
  registration_id: integer("registration_id").references(() => registrations.id), // given the id an FK constraint,
  title: varchar("title", {length:200}).notNull(),
  description: text("description").notNull(),
  is_new: boolean("is_new").default(true),
  ...timestamps
});

export const notificationRelations = relations(notification, ({one}) => ({
  member: one(members, {
    fields: [notification.member_id],
    references: [members.id],
  }),

  registration: one(registrations, {
    fields: [notification.registration_id],
    references: [registrations.id],
  }),
}));
