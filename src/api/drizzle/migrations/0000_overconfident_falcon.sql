CREATE TYPE "public"."genderTypes" AS ENUM('Male', 'Female', 'X');--> statement-breakpoint
CREATE TYPE "public"."pioneerLabel" AS ENUM('Toekomstige pioniersstudent', 'Pioniersstudent');--> statement-breakpoint
CREATE TYPE "public"."resourceTypes" AS ENUM('Studentenlink', 'Ondersteuning', '...');--> statement-breakpoint
CREATE TABLE "Addresses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Addresses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"street" varchar(255) NOT NULL,
	"housenumber" varchar(10) NOT NULL,
	"city" varchar(80) NOT NULL,
	"province" varchar(80) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Admins" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Admins_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "Admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" "pioneerLabel",
	"title" varchar(200) NOT NULL,
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"description" text NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "EventRegistrations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "EventRegistrations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" integer NOT NULL,
	"firstname" varchar(50) NOT NULL,
	"lastname" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phonenumber" varchar(14) NOT NULL,
	"label" "pioneerLabel",
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "EventRegistrations_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "FAQ" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "FAQ_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Members" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Members_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"address_id" integer NOT NULL,
	"firstname" varchar(50) NOT NULL,
	"lastname" varchar(50) NOT NULL,
	"gender" "genderTypes" NOT NULL,
	"email" varchar(255) NOT NULL,
	"phonenumber" varchar(14) NOT NULL,
	"has_payed" boolean,
	"is_student" boolean,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "Members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "Notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"member_id" integer,
	"eventRegistration_id" integer,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"is_new" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "Resources" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Resources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"type" "resourceTypes",
	"title" varchar(200) NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "EventRegistrations" ADD CONSTRAINT "EventRegistrations_event_id_Events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."Events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Members" ADD CONSTRAINT "Members_address_id_Addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."Addresses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_member_id_Members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."Members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_eventRegistration_id_EventRegistrations_id_fk" FOREIGN KEY ("eventRegistration_id") REFERENCES "public"."EventRegistrations"("id") ON DELETE no action ON UPDATE no action;