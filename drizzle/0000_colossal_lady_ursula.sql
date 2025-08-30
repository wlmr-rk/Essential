CREATE TABLE `todos` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`done` integer DEFAULT false NOT NULL
);
