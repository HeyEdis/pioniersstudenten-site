ALTER TYPE "public"."userRole" ADD VALUE 'User';--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "label" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "has_payed" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "is_student" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "type" SET NOT NULL;