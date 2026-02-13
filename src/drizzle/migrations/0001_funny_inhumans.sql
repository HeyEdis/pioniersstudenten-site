ALTER TABLE "events" ADD CONSTRAINT "events_title_unique" UNIQUE("title");--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_phonenumber_unique" UNIQUE("phonenumber");--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_phonenumber_unique" UNIQUE("phonenumber");