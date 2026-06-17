ALTER TABLE "events" ALTER COLUMN "label" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "label" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."pioneerLabel";--> statement-breakpoint
CREATE TYPE "public"."pioneerLabel" AS ENUM('Aspirante pioniersstudent', 'Pioniersstudent');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "label" SET DATA TYPE "public"."pioneerLabel" USING "label"::"public"."pioneerLabel";--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "label" SET DATA TYPE "public"."pioneerLabel" USING "label"::"public"."pioneerLabel";