// src/routes/workout.remote.ts
import { command, query } from '$app/server';
import { db } from '$lib/server/db/client';
import { workoutLogs } from '$lib/server/db/schema';
import { calculateWorkoutScore, validateWorkoutCompletion } from '$lib/scoring.js';
import { fail } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

// Validation schemas
const LocalDateSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
});

const WorkoutSchema = z.object({
	localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
	runningCompleted: z.boolean(),
	calisthenicsCompleted: z.boolean()
});

// Types
export interface WorkoutResponse {
	runningCompleted: boolean;
	calisthenicsCompleted: boolean;
	score: number;
	hasData: boolean;
}

/**
 * Query function to retrieve workout completion status for a specific date
 */
export const getTodayWorkouts = query(LocalDateSchema, async ({ localDate }) => {
	// Since you're the only user, we'll use a fixed user ID
	const userId = 'single-user';
	
	// Get workout log for the specific date
	const workoutLog = await db
		.select()
		.from(workoutLogs)
		.where(and(
			eq(workoutLogs.userId, userId),
			eq(workoutLogs.localDate, localDate)
		))
		.limit(1);
	
	if (workoutLog.length === 0) {
		return {
			runningCompleted: false,
			calisthenicsCompleted: false,
			score: 0,
			hasData: false
		} as WorkoutResponse;
	}
	
	const { runningCompleted, calisthenicsCompleted } = workoutLog[0];
	const score = calculateWorkoutScore(
		runningCompleted ?? false, 
		calisthenicsCompleted ?? false
	);
	
	return {
		runningCompleted,
		calisthenicsCompleted,
		score,
		hasData: true
	} as WorkoutResponse;
});

/**
 * Command function to create or update workout records supporting running and calisthenics toggles
 */
export const upsertWorkouts = command(WorkoutSchema, async ({ localDate, runningCompleted, calisthenicsCompleted }) => {
	// Since you're the only user, we'll use a fixed user ID
	const userId = 'single-user';
	
	// Validate workout completion data
	try {
		validateWorkoutCompletion({ runningCompleted, calisthenicsCompleted });
	} catch (error) {
		throw fail(400, { message: error instanceof Error ? error.message : 'Invalid workout completion data' });
	}
	
	const now = new Date();
	
	// Try to update existing record first
	const updated = await db
		.update(workoutLogs)
		.set({
			runningCompleted,
			calisthenicsCompleted,
			updatedAt: now
		})
		.where(and(
			eq(workoutLogs.userId, userId),
			eq(workoutLogs.localDate, localDate)
		))
		.returning();
	
	if (updated.length === 0) {
		// No existing record, create new one
		await db
			.insert(workoutLogs)
			.values({
				userId,
				localDate,
				runningCompleted,
				calisthenicsCompleted,
				createdAt: now,
				updatedAt: now
			});
	}
	
	const score = calculateWorkoutScore(runningCompleted, calisthenicsCompleted);
	
	return {
		runningCompleted,
		calisthenicsCompleted,
		score,
		hasData: true
	} as WorkoutResponse;
});