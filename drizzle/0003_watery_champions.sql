DO $$ BEGIN
 CREATE TYPE "webhook_statuses" AS ENUM('created', 'queued', 'delivered');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "webhook_types" AS ENUM('instant', 'delayed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "webhooks" ADD COLUMN "type" "webhook_types";--> statement-breakpoint
ALTER TABLE "webhooks" ADD COLUMN "status" "webhook_statuses" DEFAULT 'created' NOT NULL;