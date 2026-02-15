ALTER TABLE "notifications" DROP CONSTRAINT "notifications_registration_id_registrations_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;