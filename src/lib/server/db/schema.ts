// src/lib/server/db/schema.ts
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
	id: text('id').primaryKey(), // use nanoid or UUIDv7 in your app
	name: text('name').notNull(),
	done: boolean('done').notNull().default(false)
});
