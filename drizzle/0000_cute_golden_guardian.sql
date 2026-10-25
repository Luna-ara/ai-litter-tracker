CREATE TABLE `hotspots` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`neighborhood` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`radius_m` integer DEFAULT 75 NOT NULL,
	`severity` text NOT NULL,
	`bounty_cents` integer NOT NULL,
	`status` text DEFAULT 'unfunded' NOT NULL,
	`before_image_url` text,
	`created_by` text NOT NULL,
	`checkout_session_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payouts` (
	`id` text PRIMARY KEY NOT NULL,
	`submission_id` text NOT NULL,
	`citizen_id` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`stripe_transfer_id` text,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`citizen_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`hotspot_id` text NOT NULL,
	`citizen_id` text NOT NULL,
	`before_url` text NOT NULL,
	`after_url` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`ai_score` integer NOT NULL,
	`ai_reason` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`gov_note` text,
	`reviewed_by` text,
	`reviewed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`hotspot_id`) REFERENCES `hotspots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`citizen_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`stripe_account_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);