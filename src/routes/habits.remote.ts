// src/routes/habits.remote.ts
import { command, query } from '$app/server';
import { db } from '$lib/server/db/client';
import { habits, habitLogs } from '$lib/server/db/schema';
import { calculateHabitsScore, validateHabitCompletions, type HabitWithCompletion } from '$lib/scoring.js';
import { fail } from '@sveltejs/kit';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';
import { upsert } from '$lib/server/db/upsert';

// Validation schemas
const LocalDateSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

const HabitCompletionSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
	habitCompletions: z.array(z.object({
		habitId: z.number().int().positive('Habit ID must be a positive integer'),
		completed: z.boolean()
	}))
});

// Types
export interface HabitsData {
	habits: HabitWithCompletion[];
	score: number;
	totalWeight: number;
	completedWeight: number;
}/**

 * Query function to retrieve habit completion status for a specific date
 */
export const getTodayHabits = query(LocalDateSchema, async ({ localDate }) => {
	// Since you're the only user, we'll use a fixed user ID
	const userId = 'single-user';
	
	// Get all habits for the user
	const userHabits = await db
		.select()
		.from(habits)
		.where(eq(habits.userId, userId))
		.orderBy(habits.name);
	
	if (userHabits.length === 0) {
		return {
			habits: [],
			score: 0,
			totalWeight: 0,
			completedWeight: 0
		} as HabitsData;
	}
	
	// Get habit completion status for the specific date
	const habitCompletions = await db
		.select()
		.from(habitLogs)
		.where(and(
			eq(habitLogs.userId, userId),
			eq(habitLogs.localDate, localDate)
		));
	
	// Create a map of habit completions for quick lookup
	const completionMap = new Map(
		habitCompletions.map(log => [log.habitId, log])
	);
	
	// Combine habits with their completion status
	const habitsWithCompletion: HabitWithCompletion[] = userHabits.map(habit => ({
		id: habit.id,
		name: habit.name,
		weight: habit.weight || 1,
		completed: completionMap.get(habit.id)?.completed || false,
		completedAt: completionMap.get(habit.id)?.completedAt || null
	}));
	
	const score = calculateHabitsScore(habitsWithCompletion);
	const totalWeight = habitsWithCompletion.reduce((sum, habit) => sum + habit.weight, 0);
	const completedWeight = habitsWithCompletion
		.filter(habit => habit.completed)
		.reduce((sum, habit) => sum + habit.weight, 0);
	
	return {
		habits: habitsWithCompletion,
		score,
		totalWeight,
		completedWeight
	} as HabitsData;
});/**
 * Co
mmand function to update habit completion status with weighted habit support
 */
export const upsertHabits = command(
	HabitCompletionSchema,
	async ({ localDate, habitCompletions }) => {
		// Since you're the only user, we'll use a fixed user ID
		const userId = 'single-user';

		// Validate habit completions data
		try {
			validateHabitCompletions(habitCompletions);
		} catch (error) {
			throw fail(400, {
				message: error instanceof Error ? error.message : 'Invalid habit completion data'
			});
		}

		// Validate that all habit IDs exist and belong to the user
		const habitIds = habitCompletions.map((hc) => hc.habitId);
		const existingHabits = await db.select().from(habits).where(eq(habits.userId, userId));

		const existingHabitIds = new Set(existingHabits.map((h) => h.id));
		const invalidHabitIds = habitIds.filter((id) => !existingHabitIds.has(id));

		if (invalidHabitIds.length > 0) {
			throw fail(400, {
				message: `Invalid habit IDs: ${invalidHabitIds.join(', ')}`
			});
		}

		const now = new Date();
		const habitLogData = habitCompletions.map(({ habitId, completed }) => ({
			userId,
			habitId,
			localDate,
			completed,
			completedAt: completed ? now : null,
			createdAt: now,
			updatedAt: now
		}));

		if (habitLogData.length > 0) {
			await db
				.insert(habitLogs)
				.values(habitLogData)
				.onConflictDoUpdate({
					target: [habitLogs.userId, habitLogs.habitId, habitLogs.localDate],
					set: {
						completed: sql`excluded.completed`,
						completedAt: sql`excluded.completed_at`,
						updatedAt: now
					}
				});
		}

		// Get all habits with their updated completion status
		const allHabits = await db.select().from(habits).where(eq(habits.userId, userId)).orderBy(habits.name);
	
	const allCompletions = await db
		.select()
		.from(habitLogs)
		.where(and(
			eq(habitLogs.userId, userId),
			eq(habitLogs.localDate, localDate)
		));
	
	const completionMap = new Map(
		allCompletions.map(log => [log.habitId, log])
	);
	
	const habitsWithCompletion: HabitWithCompletion[] = allHabits.map(habit => ({
		id: habit.id,
		name: habit.name,
		weight: habit.weight || 1,
		completed: completionMap.get(habit.id)?.completed || false,
		completedAt: completionMap.get(habit.id)?.completedAt || null
	}));
	
	const score = calculateHabitsScore(habitsWithCompletion);
	const totalWeight = habitsWithCompletion.reduce((sum, habit) => sum + habit.weight, 0);
	const completedWeight = habitsWithCompletion
		.filter(habit => habit.completed)
		.reduce((sum, habit) => sum + habit.weight, 0);
	
	return {
		habits: habitsWithCompletion,
		score,
		totalWeight,
		completedWeight
	} as HabitsData;
});