CREATE TYPE "public"."genderTypes" AS ENUM('Male', 'Female', 'X');--> statement-breakpoint
CREATE TYPE "public"."pioneerLabel" AS ENUM('Toekomstige pioniersstudent', 'Pioniersstudent');--> statement-breakpoint
CREATE TYPE "public"."resourceTypes" AS ENUM('Studentenlink', 'Ondersteuning');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('Admin');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "addresses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"street" varchar(255) NOT NULL,
	"housenumber" varchar(10) NOT NULL,
	"city" varchar(80) NOT NULL,
	"province" varchar(80) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admins_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"role" "userRole",
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" "pioneerLabel",
	"title" varchar(200) NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"description" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "faq_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"address_id" integer NOT NULL,
	"firstname" varchar(50) NOT NULL,
	"lastname" varchar(50) NOT NULL,
	"gender" "genderTypes" NOT NULL,
	"email" varchar(255) NOT NULL,
	"phonenumber" varchar(14) NOT NULL,
	"has_payed" boolean,
	"is_student" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"member_id" integer,
	"registration_id" integer,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"is_new" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "registrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"firstname" varchar(50) NOT NULL,
	"lastname" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phonenumber" varchar(14) NOT NULL,
	"label" "pioneerLabel",
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registrations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" "resourceTypes",
	"title" varchar(200) NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;