import { registrations } from "@/drizzle/schema";

type RegistrationFixture = typeof registrations.$inferInsert;

export const marieRegistration: RegistrationFixture = {
  event_id: 1,
  firstname: "Marie",
  lastname: "Peeters",
  email: "marie.peeters@example.com",
  phonenumber: "0470123456",
  label: "Aspirante pioniersstudent",
};

export const sofieRegistration: RegistrationFixture = {
  event_id: 1,
  firstname: "Sofie",
  lastname: "Janssens",
  email: "sofie.janssens@example.com",
  phonenumber: "0470654321",
  label: "Aspirante pioniersstudent",
};
