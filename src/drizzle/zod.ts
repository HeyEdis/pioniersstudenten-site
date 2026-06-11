import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { address, members, faq, resource, admin, registrations, event, notification, genderTypes, resourceTypes, pioneerLabel, userRole } from "./schema";
import { z } from "zod";

/**
 * SEE: https://orm.drizzle.team/docs/zod
 * The createSelect/Insert/Update schema imports, create validation schema's to be used throughout the project.
 *
 * SELECT schema: Defines the shape of data queried from the database - can be used to validate API responses.
 * INSERT schema: Defines the shape of data to be inserted into the database - can be used to validate API requests.
 * UPDATE schema: Defines the shape of data to be updated in the database - can be used to validate API requests.
 */

export const MemberSelectSchema = createSelectSchema(members);
export const AddressSelectSchema = createSelectSchema(address);
export const FaqSelectSchema = createSelectSchema(faq);
export const ResourceSelectSchema = createSelectSchema(resource);
export const AdminSelectSchema = createSelectSchema(admin);
export const RegistrationSelectSchema = createSelectSchema(registrations);
export const EventSelectSchema = createSelectSchema(event,{
    label: z.enum(["Aspirante pioniersstudent", "Pioniersstudent"]),
    title: z.string().trim().min(1).nonempty("Titel mag niet leeg zijn."),
    date: z.string().nonempty("Datum is verplicht."),
    start_time: z.string().nonempty("Starttijd is verplicht."),
    end_time: z.string().nonempty("Eindtijd is verplicht."),
    description: z.string().trim().min(1).nonempty("Omschrijving mag niet leeg zijn."),
    image: z.string().nullable(),
    created_at: z.date(),
    updated_at: z.date(),
});
export const NotificationSelectSchema = createSelectSchema(notification);

export const MemberInsertSchema = createInsertSchema(members, {
    firstname: z.string().trim().nonempty("Voornaam mag niet leeg zijn."),
    lastname: z.string().trim().nonempty("Achternaam mag niet leeg zijn."),
    gender: z.enum(["Male", "Female"]),
    email: z.string().nonempty("Email is verplicht."),
    phonenumber: z.string().trim().max(14).nonempty("Gsm-nummer mag niet leeg zijn."),
    address_id: z.number().positive(),
    has_payed: z.boolean(),
    is_student: z.boolean(),
});
export const AddressInsertSchema = createInsertSchema(address);
export const FaqInsertSchema = createInsertSchema(faq);
export const ResourceInsertSchema = createInsertSchema(resource);
export const AdminInsertSchema = createInsertSchema(admin);
export const RegistrationInsertSchema = createInsertSchema(registrations);
export const EventInsertSchema = createInsertSchema(event,{
    label: z.enum(["Aspirante pioniersstudent", "Pioniersstudent"]),
    title: z.string().trim().min(1).nonempty("Titel mag niet leeg zijn."),
    date: z.string().nonempty("Datum is verplicht."),
    start_time: z.string().nonempty("Starttijd is verplicht."),
    end_time: z.string().nonempty("Eindtijd is verplicht."),
    description: z.string().trim().min(1).nonempty("Omschrijving mag niet leeg zijn."),
    image: z.string().nullable(),
});
export const NotificationInsertSchema = createInsertSchema(notification);

export const MemberUpdateSchema = createUpdateSchema(members, {
    firstname: z.string().trim().nonempty("Voornaam mag niet leeg zijn."),
    lastname: z.string().trim().nonempty("Achternaam mag niet leeg zijn."),
    gender: z.enum(["Male", "Female"]),
    email: z.string().nonempty("Email is verplicht."),
    phonenumber: z.string().trim().max(14).nonempty("Gsm-nummer mag niet leeg zijn."),
    address_id: z.number().positive(),
    has_payed: z.boolean(),
    is_student: z.boolean(),
});
export const AddressUpdateSchema = createUpdateSchema(address);
export const FaqUpdateSchema = createUpdateSchema(faq);
export const ResourceUpdateSchema = createUpdateSchema(resource);
export const AdminUpdateSchema = createUpdateSchema(admin);
export const RegistrationUpdateSchema = createUpdateSchema(registrations);
export const EventUpdateSchema = createUpdateSchema(event, {
    label: z.enum(["Aspirante pioniersstudent", "Pioniersstudent"]),
    title: z.string().trim().min(1).nonempty("Titel mag niet leeg zijn."),
    date: z.string().nonempty("Datum is verplicht."),
    start_time: z.string().nonempty("Starttijd is verplicht."),
    end_time: z.string().nonempty("Eindtijd is verplicht."),
    description: z.string().trim().min(1).nonempty("Omschrijving mag niet leeg zijn."),
    image: z.string().nullable(),
});
export const NotificationUpdateSchema = createUpdateSchema(notification);

export const GenderEnumSchema = z.enum(genderTypes.enumValues);
export const ResourceEnumSchema = z.enum(resourceTypes.enumValues);
export const PioneerEnumSchema = z.enum(pioneerLabel.enumValues);
export const UserEnumSchema = z.enum(userRole.enumValues);

export type Member = z.infer<typeof MemberSelectSchema>;
export type Address = z.infer<typeof AddressSelectSchema>;
export type FAQ = z.infer<typeof FaqSelectSchema>;
export type Resource = z.infer<typeof ResourceSelectSchema>;
export type Admin = z.infer<typeof AdminSelectSchema>;
export type Registration = z.infer<typeof RegistrationSelectSchema>;
export type Event = z.infer<typeof EventSelectSchema>;
export type Notification = z.infer<typeof NotificationSelectSchema>;

export type GenderEnum = z.infer<typeof GenderEnumSchema>;
export type ResourceType = z.infer<typeof ResourceEnumSchema>;
export type PioneerLabel = z.infer<typeof PioneerEnumSchema>;
export type UserRole = z.infer<typeof UserEnumSchema>;
