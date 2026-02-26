ALTER TYPE "public"."userRole" ADD VALUE 'User';--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_registration_id_registrations_id_fk";
--> statement-breakpoint
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "label" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "faq" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "faq" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "has_payed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "is_student" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "addresses" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_title_unique" UNIQUE("title");--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_phonenumber_unique" UNIQUE("phonenumber");--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_phonenumber_unique" UNIQUE("phonenumber");