CREATE TABLE "session_summary_idempotency" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"operation" text NOT NULL,
	"operation_target" text NOT NULL,
	"key_hash" char(64) NOT NULL,
	"request_hash" char(64) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"session_id" uuid,
	"response_status" smallint,
	"response_body" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session_summary_idempotency" ADD CONSTRAINT "session_summary_idempotency_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_summary_idempotency" ADD CONSTRAINT "session_summary_idempotency_session_id_typing_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."typing_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "session_summary_idempotency_subject_operation_key" ON "session_summary_idempotency" USING btree ("user_id","operation","operation_target","key_hash");--> statement-breakpoint
CREATE INDEX "session_summary_idempotency_expiry_idx" ON "session_summary_idempotency" USING btree ("expires_at");