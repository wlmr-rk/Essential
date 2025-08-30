//src/lib/server/db/schema.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const todos = sqliteTable('todos', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	done: integer('done', { mode: 'boolean' }).notNull().default(false)
});
