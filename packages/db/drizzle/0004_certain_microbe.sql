ALTER TABLE "class_members" ADD CONSTRAINT "class_members_class_id_user_id_pk" PRIMARY KEY("class_id","user_id");--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_devices_user_push_token_unique" ON "user_devices" USING btree ("user_id","push_token");--> statement-breakpoint
CREATE UNIQUE INDEX "org_members_org_user_unique" ON "org_members" USING btree ("org_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_seats_subscription_user_unique" ON "subscription_seats" USING btree ("subscription_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_entity_unique" ON "subscriptions" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_categories_language_slug_unique" ON "lesson_categories" USING btree ("language_code","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "lessons_language_slug_unique" ON "lessons" USING btree ("language_code","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_stats_user_date_language_unique" ON "daily_stats" USING btree ("user_id","date","language_code");--> statement-breakpoint
CREATE UNIQUE INDEX "key_mastery_user_layout_key_unique" ON "key_mastery" USING btree ("user_id","layout_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "user_progress_user_lesson_unique" ON "user_progress" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "leaderboards_type_scope_value_unique" ON "leaderboards" USING btree ("type","scope","scope_value");--> statement-breakpoint
CREATE UNIQUE INDEX "streaks_user_type_unique" ON "streaks" USING btree ("user_id","type");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievements_user_achievement_unique" ON "user_achievements" USING btree ("user_id","achievement_id");