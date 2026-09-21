ALTER TABLE "user_preferences" ALTER COLUMN "email_streak_reminder" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_preferences" ALTER COLUMN "email_weekly_report" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_profiles" ALTER COLUMN "show_on_leaderboard" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "org_billing" ALTER COLUMN "seat_price_cents" SET DEFAULT 0;