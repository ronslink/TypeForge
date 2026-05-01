CREATE TABLE IF NOT EXISTS "user_placement_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"test_id" text NOT NULL,
	"passed" boolean NOT NULL,
	"accuracy" real,
	"wpm" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_placement_results" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_placement_results" ADD COLUMN IF NOT EXISTS "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "user_placement_results" ADD COLUMN IF NOT EXISTS "test_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user_placement_results" ADD COLUMN IF NOT EXISTS "passed" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "user_placement_results" ADD COLUMN IF NOT EXISTS "accuracy" real;--> statement-breakpoint
ALTER TABLE "user_placement_results" ADD COLUMN IF NOT EXISTS "wpm" real;--> statement-breakpoint
ALTER TABLE "user_placement_results" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "org_settings" ADD COLUMN IF NOT EXISTS "placement_test_cooldown_hours" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "org_settings" ADD COLUMN IF NOT EXISTS "placement_tests_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "org_settings" ADD COLUMN IF NOT EXISTS "default_ui_locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "org_billing" ADD COLUMN IF NOT EXISTS "seat_cooldown_days" integer DEFAULT 180 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_seats" ADD COLUMN IF NOT EXISTS "reassignable_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "user_placement_results" ADD CONSTRAINT "user_placement_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
