ALTER TABLE "registrations" DROP CONSTRAINT "registrations_email_unique";--> statement-breakpoint
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_phonenumber_unique";--> statement-breakpoint
ALTER TABLE "registrations" ALTER COLUMN "label" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_event_email_unique" ON "registrations" USING btree ("event_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_event_phonenumber_unique" ON "registrations" USING btree ("event_id","phonenumber");