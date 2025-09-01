// src/lib/server/db/schema.ts
import { boolean, integer, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';

// Sleep logs table
export const sleepLogs = pgTable('sleep_logs', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	localDate: text('local_date').notNull(),
	sleepStartLocal: text('sleep_start_local').notNull(),
	wakeTimeLocal: text('wake_time_local').notNull(),
	sleepStartTs: timestamp('sleep_start_ts', { withTimezone: true }).notNull(),
	wakeTs: timestamp('wake_ts', { withTimezone: true }).notNull(),
	durationMins: integer('duration_mins').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
	userDateUnique: unique().on(table.userId, table.localDate)
}));

// Habits table
export const habits = pgTable('habits', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	name: text('name').notNull(),
	weight: integer('weight').default(1),
	createdAt: timestamp('created_at').defaultNow()
});

// Habit logs table
export const habitLogs = pgTable('habit_logs', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	habitId: integer('habit_id').references(() => habits.id),
	localDate: text('local_date').notNull(),
	completed: boolean('completed').default(false),
	completedAt: timestamp('completed_at'),
	createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
	userHabitDateUnique: unique().on(table.userId, table.habitId, table.localDate)
}));

// Mood logs table
export const moodLogs = pgTable('mood_logs', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	localDate: text('local_date').notNull(),
	rating: integer('rating').notNull(), // 1-5 scale
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
	userDateUnique: unique().on(table.userId, table.localDate)
}));

// Workout logs table
export const workoutLogs = pgTable('workout_logs', {
	id: serial('id').primaryKey(),
	userId: text('user_id').notNull(),
	localDate: text('local_date').notNull(),
	runningCompleted: boolean('running_completed').default(false),
	calisthenicsCompleted: boolean('calisthenics_completed').default(false),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
	userDateUnique: unique().on(table.userId, table.localDate)
}));
